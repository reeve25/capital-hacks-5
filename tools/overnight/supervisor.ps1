# FeelInk overnight supervisor: runs sequential headless Claude lead sessions until DONE, STOP or the deadline.
# Minimal by design (Reeve, Sun Nov 8 02:30; advisor fixes 02:40): one loop, one lock, polled child, bounded retries, logs.
#   test:     powershell -NoProfile -ExecutionPolicy Bypass -File tools/overnight/supervisor.ps1 -Mode test
#   stoptest: ... -Mode stoptest -StopGraceMinutes 1     (then create .tmp/overnight-state/STOP while the child runs)
#   run:      ... -Mode run   (start detached, minimized; log .tmp/overnight-state/supervisor-run.log)
param(
  [ValidateSet('run','test','stoptest')] [string]$Mode = 'run',
  [int]$MaxSessions = 14,
  [string]$Deadline = '06:20',       # no new session starts at or after this local time (run mode)
  [string]$Model = 'fable',
  [string]$Effort = 'xhigh',
  [int]$PollSeconds = 15,
  [int]$ProgressLogMinutes = 2,      # "alive" line cadence
  [int]$StopGraceMinutes = 20,       # after STOP: wait this long for the child to finish its turn, then kill the tree
  [int]$MaxSessionMinutes = 150,     # past this, a quiet child is treated as hung sooner
  [int]$HungQuietMinutes = 30        # no transcript write for this long (15 past MaxSessionMinutes) = hung -> kill tree
)
$ErrorActionPreference = 'Stop'
$Repo  = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$State = Join-Path $Repo '.tmp\overnight-state'
New-Item -ItemType Directory -Force $State | Out-Null
$Log   = Join-Path $State "supervisor-$Mode.log"
$Jsonl = Join-Path $State "sessions-$Mode.jsonl"
$Lock  = Join-Path $State 'lead.lock'
$Done  = Join-Path $State 'DONE'
$Stop  = Join-Path $State 'STOP'
$PidFile = Join-Path $State 'supervisor.pid'
$Claude = 'C:\Users\reeve\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe'
$Transcripts = Join-Path $env:USERPROFILE ('.claude\projects\' + ($Repo -replace '[:\\]', '-'))

function Log([string]$m) { $line = "{0} {1}" -f (Get-Date -Format 'HH:mm:ss'), $m; Add-Content -Path $Log -Value $line -Encoding utf8; Write-Host $line }
function LockHeldByLive {
  if (-not (Test-Path $Lock)) { return $false }
  $p = (Get-Content $Lock -ErrorAction SilentlyContinue | Select-Object -First 1) -as [int]
  if ($p -and (Get-Process -Id $p -ErrorAction SilentlyContinue)) { return $true }
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue; return $false
}
function KillTree([int]$ProcId, [string]$why) {
  Log "KILL pid $ProcId and children: $why"
  & taskkill /PID $ProcId /T /F 2>&1 | ForEach-Object { Log "  taskkill: $_" }
}
function TranscriptInfo([string]$sid) {
  $f = Join-Path $Transcripts "$sid.jsonl"
  if (-not (Test-Path $f)) { return @{ exists=$false; kb=0; ageSec=-1; last='no transcript yet' } }
  $fi = Get-Item $f
  $last = ''
  try {
    $tailLine = Get-Content $f -Tail 1 -ErrorAction SilentlyContinue
    if ($tailLine -match '"name":"([A-Za-z_]+)"') { $last = $Matches[1] }
    if ($tailLine -match '"type":"([a-z_]+)"') { $last = ("{0} {1}" -f $Matches[1], $last).Trim() }
  } catch { $last = '?' }
  return @{ exists=$true; kb=[int]($fi.Length/1KB); ageSec=[int]((Get-Date) - $fi.LastWriteTime).TotalSeconds; last=$last }
}
$Fatal = 'not logged in|please run /login|authentication|unauthorized|\b401\b|\b403\b|usage limit|rate limit|out of (credits|usage)|allowance|unsupported model|model .* not (found|available)|permission denied|invalid api key'

# single-supervisor guard
if (Test-Path $PidFile) {
  $old = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1) -as [int]
  if ($old -and $old -ne $PID) {
    $op = Get-Process -Id $old -ErrorAction SilentlyContinue
    if ($op -and $op.ProcessName -match 'powershell|pwsh') { Write-Host "another supervisor is running (pid $old); refusing to start a second one"; exit 3 }
  }
}
Set-Content -Path $PidFile -Value $PID -Encoding utf8
Log "supervisor start mode=$Mode pid=$PID repo=$Repo model=$Model effort=$Effort maxSessions=$MaxSessions deadline=$Deadline stopGrace=${StopGraceMinutes}m maxSession=${MaxSessionMinutes}m hungQuiet=${HungQuietMinutes}m transcripts=$Transcripts"
if ($Mode -ne 'stoptest') { Remove-Item $Done, $Stop -Force -ErrorAction SilentlyContinue }

$n = 0; $transient = 0; $fatalCount = 0; $prevNote = ''
while ($true) {
  if (Test-Path $Done) { Log 'DONE present: lead reported completion. Exiting.'; break }
  if (Test-Path $Stop) { Log ("STOP present: " + (Get-Content $Stop -Raw -ErrorAction SilentlyContinue)); break }
  if ($n -ge $MaxSessions) { Log "max sessions ($MaxSessions) reached. Exiting."; break }
  $now = Get-Date
  $dl = [datetime]::ParseExact($Deadline, 'HH:mm', $null)
  if ($Mode -eq 'run' -and $now.TimeOfDay -ge $dl.TimeOfDay -and $now.Hour -lt 12) { Log "deadline $Deadline reached. No new session. Exiting."; break }
  if (LockHeldByLive) { Log 'another lead holds lead.lock; waiting 60 s'; Start-Sleep 60; continue }
  if ($Mode -eq 'test' -and $n -ge 2) { Log 'test complete (2 sessions). Exiting.'; break }
  if ($Mode -eq 'stoptest' -and $n -ge 1) { Log 'stoptest complete (1 session). Exiting.'; break }

  $n++
  switch ($Mode) {
    'test'     { $promptFile = Join-Path $PSScriptRoot ("test-prompt-" + @('A','B')[$n-1] + ".md") }
    'stoptest' { $promptFile = Join-Path $PSScriptRoot 'test-prompt-C.md' }
    default    { $promptFile = Join-Path $PSScriptRoot 'session-prompt.md' }
  }
  $sid = [guid]::NewGuid().ToString()
  $prompt = (Get-Content $promptFile -Raw) -replace '\{\{N\}\}', $n -replace '\{\{NOW\}\}', (Get-Date -Format 'ddd MMM d HH:mm') -replace '\{\{REPO\}\}', $Repo -replace '\{\{PREV\}\}', $prevNote
  $out = Join-Path $State ("session-$Mode-$n.json")
  $err = Join-Path $State ("session-$Mode-$n.stderr.log")
  Set-Content -Path (Join-Path $State ("prompt-$Mode-$n.md")) -Value $prompt -Encoding utf8
  Log "session $n starting session_id=$sid prompt=$(Split-Path $promptFile -Leaf)"
  $t0 = Get-Date
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $Claude
  $psi.Arguments = "-p --model $Model --effort $Effort --permission-mode bypassPermissions --chrome --output-format json --session-id $sid"
  $psi.WorkingDirectory = $Repo
  $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
  $proc = [System.Diagnostics.Process]::Start($psi)
  Set-Content -Path $Lock -Value $proc.Id -Encoding utf8
  $proc.StandardInput.Write($prompt); $proc.StandardInput.Close()
  $stdoutTask = $proc.StandardOutput.ReadToEndAsync(); $stderrTask = $proc.StandardError.ReadToEndAsync()

  # poll the child: progress lines, STOP with grace, bounded hung recovery
  $killed = ''; $stopSeen = $null; $lastProgressLog = Get-Date
  while (-not $proc.HasExited) {
    Start-Sleep $PollSeconds
    if ($proc.HasExited) { break }
    $elapsedMin = ((Get-Date) - $t0).TotalMinutes
    $ti = TranscriptInfo $sid
    if (((Get-Date) - $lastProgressLog).TotalMinutes -ge $ProgressLogMinutes) {
      Log ("session $n alive {0:n0} min, transcript {1} KB, last write {2} s ago, last: {3}" -f $elapsedMin, $ti.kb, $ti.ageSec, $ti.last)
      $lastProgressLog = Get-Date
    }
    if ((Test-Path $Stop) -and -not $stopSeen) { $stopSeen = Get-Date; Log "STOP requested while session $n runs; waiting up to $StopGraceMinutes min for it to finish its turn at a safe boundary" }
    if ($stopSeen -and ((Get-Date) - $stopSeen).TotalMinutes -ge $StopGraceMinutes) { $killed = 'STOP grace expired'; KillTree $proc.Id $killed; break }
    $quietMin = if ($ti.exists) { $ti.ageSec / 60 } else { $elapsedMin }
    $hungLimit = if ($elapsedMin -ge $MaxSessionMinutes) { [Math]::Min($HungQuietMinutes, 15) } else { $HungQuietMinutes }
    if ($quietMin -ge $hungLimit) { $killed = ("hung: no transcript write for {0:n0} min (elapsed {1:n0} min)" -f $quietMin, $elapsedMin); KillTree $proc.Id $killed; break }
    if ($elapsedMin -ge $MaxSessionMinutes -and $ti.exists -and $quietMin -lt 2 -and [int]$elapsedMin % 10 -eq 0) { Log ("session $n past {0} min but still writing; leaving it to finish its turn" -f $MaxSessionMinutes) }
  }
  if (-not $proc.WaitForExit(30000)) { KillTree $proc.Id 'did not exit after kill request' }
  $stdout = ''; $stderr = ''
  try { $stdout = $stdoutTask.Result } catch {}
  try { $stderr = $stderrTask.Result } catch {}
  Set-Content -Path $out -Value $stdout -Encoding utf8
  Set-Content -Path $err -Value $stderr -Encoding utf8
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue
  $code = $proc.ExitCode
  $secs = [int]((Get-Date) - $t0).TotalSeconds
  $isErr = $null; $turns = ''; $cost = ''; $tail = ''; $ctx = ''; $rsid = ''
  try {
    $j = $stdout | ConvertFrom-Json
    $rsid = $j.session_id; $isErr = $j.is_error; $turns = $j.num_turns; $cost = $j.total_cost_usd
    if ($j.result) { $tail = ($j.result -replace '\s+', ' '); if ($tail.Length -gt 400) { $tail = $tail.Substring($tail.Length - 400) } }
    if ($j.modelUsage) { $ctx = ($j.modelUsage.PSObject.Properties | ForEach-Object { "{0}:in={1} cacheRead={2} cacheCreate={3}" -f $_.Name, $_.Value.inputTokens, $_.Value.cacheReadInputTokens, $_.Value.cacheCreationInputTokens }) -join '; ' }
  } catch { $tail = 'unparseable stdout: ' + ($stdout.Substring(0, [Math]::Min(200, $stdout.Length)) -replace '\s+', ' ') }
  $ti = TranscriptInfo $sid
  $rec = [ordered]@{ n=$n; mode=$Mode; started=$t0.ToString('s'); seconds=$secs; exit=$code; session_id=$sid; result_session_id=$rsid; killed=$killed; is_error=$isErr; num_turns=$turns; cost_usd=$cost; usage=$ctx; transcript_kb=$ti.kb; result_tail=$tail; stderr_tail=(($stderr -replace '\s+',' ')[-300..-1] -join '') }
  Add-Content -Path $Jsonl -Value ($rec | ConvertTo-Json -Compress) -Encoding utf8
  Log "session $n ended exit=$code seconds=$secs killed=[$killed] is_error=$isErr turns=$turns transcript=$($ti.kb)KB usage=[$ctx]"
  if ($tail) { Log "session $n result tail: $tail" }

  if ($killed) {
    $prevNote = "NOTE: the previous supervised session ($n, id $sid) was killed at $(Get-Date -Format 'HH:mm') because: $killed. Its checkpoint may be stale: first run git status --short, git worktree list and git stash list, read .tmp/overnight-checkpoint.md, and reconcile before new work."
    if (Test-Path $Stop) { Log 'STOP present after kill; exiting.'; break }
    Start-Sleep 60; continue
  }
  $prevNote = ''
  $failed = ($code -ne 0) -or ($isErr -eq $true) -or (-not $rsid)
  if ($failed) {
    $blob = ($stdout + ' ' + $stderr)
    if ($blob -match $Fatal) {
      $fatalCount++; Log "FATAL-class failure ($fatalCount): $($Matches[0])"
      if ($fatalCount -ge 2) { Log 'two fatal-class failures; stopping (no blind restarts).'; Set-Content $Stop "supervisor stopped after fatal-class failures: $($Matches[0])"; break }
      Start-Sleep 120; continue
    }
    $transient++
    if ($transient -ge 5) { Log 'five consecutive transient failures; stopping.'; Set-Content $Stop 'supervisor stopped after 5 transient failures'; break }
    $wait = [Math]::Min(600, 30 * [Math]::Pow(2, $transient - 1)); Log "transient failure $transient; backoff $wait s"; Start-Sleep $wait; continue
  }
  $transient = 0; $fatalCount = 0
  if ($Mode -eq 'run' -and $secs -lt 90) { Log 'session ended in under 90 s without DONE; pausing 60 s before the next one'; Start-Sleep 60 }
}
Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
Log 'supervisor exit'
