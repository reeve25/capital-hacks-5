# Export every slide of a .pptx to PNG with PowerPoint (COM), for visual QA. Usage: -File export_png.ps1 <deck.pptx> <outdir>
param([Parameter(Mandatory=$true)][string]$Deck, [Parameter(Mandatory=$true)][string]$OutDir)
$ErrorActionPreference = 'Stop'
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Path $OutDir | Out-Null
$app = New-Object -ComObject PowerPoint.Application
try {
  # Open(FileName, ReadOnly, Untitled, WithWindow)
  $pres = $app.Presentations.Open((Resolve-Path $Deck).Path, -1, 0, 0)
  "slides: $($pres.Slides.Count); size: $($pres.PageSetup.SlideWidth) x $($pres.PageSetup.SlideHeight) pt"
  $pres.Export($OutDir, 'PNG', 1600, 900)
  $pres.Close()
} finally {
  $app.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
}
Get-ChildItem $OutDir | Sort-Object Name | ForEach-Object { "$($_.Name) $([math]::Round($_.Length/1KB)) KB" }
