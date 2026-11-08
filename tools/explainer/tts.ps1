param([string]$Dir)
Add-Type -AssemblyName System.Speech
$lines = Get-Content (Join-Path $Dir 'narration.txt') | Where-Object { $_.Trim() -ne '' }
$i = 0
foreach ($line in $lines) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice('Microsoft Zira Desktop')
  $s.Rate = -1
  $out = Join-Path $Dir ("seg_{0}.wav" -f $i)
  $s.SetOutputToWaveFile($out)
  $s.Speak($line)
  $s.Dispose()
  $i++
}
"wrote $i segments"
