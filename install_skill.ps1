param(
    [string]$Action = "list",
    [string]$Query = ""
)

$ScratchPath = "C:\Users\G15 5530\.gemini\antigravity-ide\brain\2029f102-82b5-4f57-b7e6-dcd49a112574\scratch\agentic-awesome-skills\skills"
$TargetDir = Join-Path $PSScriptRoot ".agents\skills"

if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

switch ($Action.ToLower()) {
    "list" {
        Write-Host "=== Installed Workspace Skills (.agents/skills) ===" -ForegroundColor Green
        Get-ChildItem $TargetDir -Directory | Select-Object Name | Format-Table -HideTableHeaders
        Write-Host "Total Installed: $((Get-ChildItem $TargetDir -Directory).Count)" -ForegroundColor Cyan
    }

    "search" {
        if ([string]::IsNullOrWhiteSpace($Query)) {
            Write-Host "Usage: .\install_skill.ps1 -Action search -Query <keyword>" -ForegroundColor Yellow
            return
        }
        Write-Host "=== Searching Catalog for '$Query' ===" -ForegroundColor Green
        if (Test-Path $ScratchPath) {
            $matches = Get-ChildItem $ScratchPath -Directory | Where-Object { $_.Name -like "*$Query*" }
            if ($matches.Count -eq 0) {
                Write-Host "No skills found matching '$Query'." -ForegroundColor Yellow
            } else {
                $matches | Select-Object Name | Format-Table -HideTableHeaders
                Write-Host "Found $($matches.Count) matching skills." -ForegroundColor Cyan
            }
        } else {
            Write-Host "Catalog cache not found at $ScratchPath" -ForegroundColor Red
        }
    }

    "add" {
        if ([string]::IsNullOrWhiteSpace($Query)) {
            Write-Host "Usage: .\install_skill.ps1 -Action add -Query <skill-name>" -ForegroundColor Yellow
            return
        }
        $skillSrc = Join-Path $ScratchPath $Query
        if (Test-Path $skillSrc) {
            Copy-Item -Path $skillSrc -Destination $TargetDir -Recurse -Force
            Write-Host "[SUCCESS] Skill '$Query' copied to .agents\skills!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Skill '$Query' not found in catalog." -ForegroundColor Red
            Write-Host "Try searching: .\install_skill.ps1 -Action search -Query $Query" -ForegroundColor Yellow
        }
    }

    default {
        Write-Host "Available commands:" -ForegroundColor Cyan
        Write-Host "  .\install_skill.ps1 -Action list"
        Write-Host "  .\install_skill.ps1 -Action search -Query <keyword>"
        Write-Host "  .\install_skill.ps1 -Action add -Query <skill-name>"
    }
}
