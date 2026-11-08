# FeelInk overnight supervisor: runs sequential headless Claude lead sessions until DONE, STOP or the deadline.
# Minimal by design (Reeve, Sun Nov 8 02:30): one loop, one lock, bounded retries, logs. No API billing (subscription auth).
#   test:  powershell -NoProfile -ExecutionPolicy Bypass -File tools/overnight/supervisor.ps1 -Mode test
#   run:   powershell -NoProfile -ExecutionPolicy Bypass -File tools/overnight/supervisor.ps1 -Mode run   (start detached, see README)
param(
  [ValidateSet('run','test')] [string]$Mode = 'run',
  [int]$MaxSessions = 14,
  [string]$Deadline = '06:20',      # no new session starts at or after this local time
  [string]$Model = 'fable',
  [string]$Effort = 'xhigh'
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
$Claude = 'C:\Users\reeve\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe'

function Log([string]$m) { $line = "{0} {1}" -f (Get-Date -Format 'HH:mm:ss'), $m; Add-Content -Path $Log -Value $line -Encoding utf8; Write-Host $line }
function LockHeldByLive {
  if (-not (Test-Path $Lock)) { return $false }
  $p = (Get-Content $Lock -ErrorAction SilentlyContinue | Select-Object -First 1) -as [int]
  if ($p -and (Get-Process -Id $p -ErrorAction SilentlyContinue)) { return $true }
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue; return $false
}
$Fatal = 'not logged in|please run /login|authentication|unauthorized|\b401\b|\b403\b|usage limit|rate limit|out of (credits|usage)|allowance|unsupported model|model .* not (found|available)|permission denied|invalid api key'

Set-Content -Path (Join-Path $State 'supervisor.pid') -Value $PID -Encoding utf8
Log "supervisor start mode=$Mode pid=$PID repo=$Repo model=$Model effort=$Effort maxSessions=$MaxSessions deadline=$Deadline"
if ($Mode -eq 'run') { Remove-Item $Done, $Stop -Force -ErrorAction SilentlyContinue }

$n = 0; $transient = 0; $fatalCount = 0
while ($true) {
  if (Test-Path $Done) { Log 'DONE present: lead reported completion. Exiting.'; break }
  if (Test-Path $Stop) { Log ("STOP present: " + (Get-Content $Stop -Raw -ErrorAction SilentlyContinue)); break }
  if ($n -ge $MaxSessions) { Log "max sessions ($MaxSessions) reached. Exiting."; break }
  $now = Get-Date
  $dl = [datetime]::ParseExact($Deadline, 'HH:mm', $null)
  if ($Mode -eq 'run' -and $now.TimeOfDay -ge $dl.TimeOfDay -and $now.Hour -lt 12) { Log "deadline $Deadline reached. No new session. Exiting."; break }
  if (LockHeldByLive) { Log 'another lead holds lead.lock; waiting 60 s'; Start-Sleep 60; continue }
  if ($Mode -eq 'test' -and $n -ge 2) { Log 'test complete (2 sessions). Exiting.'; break }

  $n++
  if ($Mode -eq 'test') {
    $promptFile = Join-Path $PSScriptRoot ("test-prompt-" + @('A','B')[$n-1] + ".md")
  } else {
    $promptFile = Join-Path $PSScriptRoot 'session-prompt.md'
  }
  $prompt = (Get-Content $promptFile -Raw) -replace '\{\{N\}\}', $n -replace '\{\{NOW\}\}', (Get-Date -Format 'ddd MMM d HH:mm') -replace '\{\{REPO\}\}', $Repo
  $out = Join-Path $State ("session-$Mode-$n.json")
  $err = Join-Path $State ("session-$Mode-$n.stderr.log")
  $tmpPrompt = Join-Path $State ("prompt-$Mode-$n.md")
  Set-Content -Path $tmpPrompt -Value $prompt -Encoding utf8
  Log "session $n starting ($promptFile)"
  $t0 = Get-Date
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $Claude
  $psi.Arguments = "-p --model $Model --effort $Effort --permission-mode bypassPermissions --chrome --output-format json"
  $psi.WorkingDirectory = $Repo
  $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
  $proc = [System.Diagnostics.Process]::Start($psi)
  Set-Content -Path $Lock -Value $proc.Id -Encoding utf8
  $proc.StandardInput.Write($prompt); $proc.StandardInput.Close()
  $stdoutTask = $proc.StandardOutput.ReadToEndAsync(); $stderrTask = $proc.StandardError.ReadToEndAsync()
  $proc.WaitForExit()
  $stdout = $stdoutTask.Result; $stderr = $stderrTask.Result
  Set-Content -Path $out -Value $stdout -Encoding utf8
  Set-Content -Path $err -Value $stderr -Encoding utf8
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue
  $code = $proc.ExitCode
  $secs = [int]((Get-Date) - $t0).TotalSeconds
  $sid = ''; $isErr = $null; $turns = ''; $cost = ''; $tail = ''; $ctx = ''
  try {
    $j = $stdout | ConvertFrom-Json
    $sid = $j.session_id; $isErr = $j.is_error; $turns = $j.num_turns; $cost = $j.total_cost_usd
    if ($j.result) { $tail = ($j.result -replace '\s+', ' '); if ($tail.Length -gt 300) { $tail = $tail.Substring($tail.Length - 300) } }
    if ($j.modelUsage) { $ctx = ($j.modelUsage.PSObject.Properties | ForEach-Object { "{0}:in={1} cacheRead={2} cacheCreate={3} ctxWindow={4}" -f $_.Name, $_.Value.inputTokens, $_.Value.cacheReadInputTokens, $_.Value.cacheCreationInputTokens, $_.Value.contextWindow }) -join '; ' }
  } catch { $tail = 'unparseable stdout: ' + ($stdout.Substring(0, [Math]::Min(200, $stdout.Length)) -replace '\s+', ' ') }
  $rec = [ordered]@{ n=$n; mode=$Mode; started=$t0.ToString('s'); seconds=$secs; exit=$code; session_id=$sid; is_error=$isErr; num_turns=$turns; cost_usd=$cost; usage=$ctx; result_tail=$tail; stderr_tail=(($stderr -replace '\s+',' ')[-300..-1] -join '') }
  Add-Content -Path $Jsonl -Value ($rec | ConvertTo-Json -Compress) -Encoding utf8
  Log "session $n ended exit=$code seconds=$secs session_id=$sid is_error=$isErr turns=$turns usage=[$ctx]"

  $failed = ($code -ne 0) -or ($isErr -eq $true) -or (-not $sid)
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
Log 'supervisor exit'
