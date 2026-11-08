# Logs when the Pixel (Google USB vendor 18D1) appears on or vanishes from Windows, one line per change, to .tmp/usb-events.log.
# Run: powershell -NoProfile -File tools/usb_watch.ps1   (poll every second; Ctrl+C to stop). Correlate with .tmp/keepalive.log:
# a keepalive DROPPED with no USB line here = adb or phone-side (adbd, debugging mode); with a USB ABSENT line = the OS lost the device.
# A write that fails (another process reading the log) is retried next second; the transition is kept until it is written.
$log = Join-Path $PSScriptRoot "..\.tmp\usb-events.log"
$prev = $null
$pendingLine = $null
function Write-Line($line) { try { [System.IO.File]::AppendAllText($log, $line + "`r`n"); return $true } catch { return $false } }
while ($true) {
  $now = (Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object { $_.InstanceId -match 'VID_18D1' } | ForEach-Object { "$($_.Status) $($_.Class) $($_.FriendlyName)" } | Sort-Object) -join '; '
  if ($null -eq $prev) {
    $pendingLine = "{0:yyyy-MM-dd HH:mm:ss} USB watch started, now: [{1}]" -f (Get-Date), $now
  } elseif ($now -ne $prev) {
    $state = if ($now) { "PRESENT [$now]" } else { "ABSENT (was [$prev])" }
    $line = "{0:yyyy-MM-dd HH:mm:ss} USB {1}" -f (Get-Date), $state
    if ($pendingLine) { $pendingLine = $pendingLine + "`r`n" + $line } else { $pendingLine = $line }
  }
  if ($pendingLine -and (Write-Line $pendingLine)) { $pendingLine = $null }
  $prev = $now
  Start-Sleep -Seconds 1
}
