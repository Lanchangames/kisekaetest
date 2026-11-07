param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) {
    throw 'Put this script next to your game index.html and run it again.'
}

$prefixes = @('acc', 'bg', 'tops', 'bottoms', 'clothes', 'meat')
$moves = @(
    foreach ($file in (Get-ChildItem -LiteralPath $root -File)) {
        if ($file.Name -cmatch '^(acc|bg|tops|bottoms|clothes|meat)_[^/\\]+\.png$') {
            $prefix = $Matches[1]
            [PSCustomObject]@{
                Source = $file.FullName
                Destination = Join-Path (Join-Path (Join-Path $root 'images') $prefix) $file.Name
                Group = $prefix
            }
        }
    }
)
Write-Host 'Game folder:' $root
foreach ($prefix in $prefixes) {
    $count = @($moves | Where-Object { $_.Group -eq $prefix }).Count
    Write-Host ("{0}: {1} file(s)" -f $prefix, $count)
}
if ($moves.Count -eq 0) {
    Write-Host 'No matching files in the game folder. Nothing changed.'
    exit 0
}
$conflicts = @($moves | Where-Object { Test-Path -LiteralPath $_.Destination })
if ($conflicts.Count -gt 0) {
    Write-Host 'These destination files already exist. No files were moved:'
    $conflicts | ForEach-Object { Write-Host $_.Destination }
    exit 1
}
if (-not $Apply) {
    Write-Host 'Preview only. No files were moved. Run with -Apply to move them.'
    exit 0
}
foreach ($prefix in ($moves.Group | Select-Object -Unique)) {
    $directory = Join-Path (Join-Path $root 'images') $prefix
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}
foreach ($move in $moves) {
    Move-Item -LiteralPath $move.Source -Destination $move.Destination -ErrorAction Stop
}
Write-Host ("Moved {0} file(s). File names were preserved." -f $moves.Count)
