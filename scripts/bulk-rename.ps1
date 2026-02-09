$ErrorActionPreference = "Continue"

# Get all app directories (skip node_modules at top level)
$appDirs = Get-ChildItem -Path "C:\hua\apps" -Directory | Where-Object { $_.Name -ne "node_modules" }

$allFiles = @()
foreach ($appDir in $appDirs) {
    # Get files but exclude node_modules subdirectories
    $tsFiles = Get-ChildItem -Path $appDir.FullName -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notlike "*\node_modules\*" -and
        $_.FullName -notlike "*SumdiHuaProvider.tsx"
    }
    $allFiles += $tsFiles
}

Write-Output ("Found " + $allFiles.Count + " files to check")

$count = 0
foreach ($file in $allFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        if ($null -eq $content) { continue }
        $original = $content

        # 1. @hua-labs/hua-ux -> @hua-labs/hua
        $content = $content -replace '@hua-labs/hua-ux', '@hua-labs/hua'

        # 2. HuaUxLayout -> HuaProvider
        $content = $content -replace 'HuaUxLayout', 'HuaProvider'

        # 3. HuaUxPage -> HuaPage
        $content = $content -replace 'HuaUxPage', 'HuaPage'

        # 4. HuaUxConfig -> HuaConfig
        $content = $content -replace 'HuaUxConfig', 'HuaConfig'

        # 5. SumdiHuaUxLayout -> SumdiHuaProvider
        $content = $content -replace 'SumdiHuaUxLayout', 'SumdiHuaProvider'

        # 6. hua-ux.config -> hua.config (import paths)
        $content = $content -replace 'hua-ux\.config', 'hua.config'

        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
            $count++
            Write-Output ("Updated: " + $file.FullName)
        }
    } catch {
        Write-Output ("Error processing: " + $file.FullName + " - " + $_.Exception.Message)
    }
}

Write-Output ("`nTotal files updated: " + $count)
