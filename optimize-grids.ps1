# PowerShell script to optimize grid layouts for all admin pages
# Ensures stats grids adapt properly to all screen sizes

$files = @(
    "src/pages/AdminFleetPage.tsx",
    "src/pages/AdminDashboardPage.tsx",
    "src/pages/AdminBookingsPage.tsx",
    "src/pages/AdminCustomersPage.tsx",
    "src/pages/AdminDriversPage.tsx"
)

function Update-GridLayouts {
    param([string]$file)
    
    $content = Get-Content $file -Raw
    
    # Fix stats-grid to use proper responsive columns
    $content = $content -replace 'grid-template-columns: repeat\(4, 1fr\);', 'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));'
    $content = $content -replace 'grid-template-columns: repeat\(3, 1fr\);', 'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));'
    $content = $content -replace 'grid-template-columns: repeat\(2, 1fr\);', 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));'
    
    # Ensure max 4 columns on large screens
    if ($content -match '\.stats-grid \{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(240px, 1fr\)\);') {
        # Add max columns constraint for 4K
        $gridPattern = '(\.stats-grid \{[^}]*)(grid-template-columns: repeat\(auto-fit, minmax\(240px, 1fr\)\);)'
        if ($content -match $gridPattern) {
            $content = $content -replace $gridPattern, '$1$2' + "`n          max-width: 100%;"
        }
    }
    
    Set-Content $file -Value $content -NoNewline
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Optimizing grid layout in $file..."
        Update-GridLayouts -file $file
        Write-Host "  Updated $file" -ForegroundColor Green
    }
}

Write-Host "Grid layouts optimized!" -ForegroundColor Cyan
