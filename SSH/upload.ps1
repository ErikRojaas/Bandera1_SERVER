# upload.ps1

# Load config.env variables
$configFile = "config.env"
Get-Content $configFile | ForEach-Object {
    $line = $_
    if ($line -match "(\S+)\s*=\s*(.+)") {
        $key = $matches[1]
        $value = $matches[2]

        if ($value -like "*HOME*") {
            $value = $value -replace "HOME", "$HOME"
            $value = $value -replace '\$', ''
        }

        $value = $value -replace '/', '\'
        $value = $value -replace '"', ''

        Set-Variable -Name $key -Value $value
    }
}

$USER = if ($args.Count -ge 1) { $args[0] } else { $DEFAULT_USER }
$RSA_PATH = if ($args.Count -ge 2) { $args[1] } else { $DEFAULT_RSA_PATH }
$LOCAL_FILE = if ($args.Count -ge 4) { $args[3] } else { Read-Host "Path to local file" }
$REMOTE_PATH = if ($args.Count -ge 5) { $args[4] } else { Read-Host "Remote path" }

if (-Not (Test-Path $RSA_PATH)) {
    Write-Host "Error: No s'ha trobat el fitxer de clau privada: $RSA_PATH"
    exit 1
}

# Check if remote file exists
$checkCommand = "test -e '$REMOTE_PATH' && echo EXISTS || echo NOT_EXISTS"
$remoteCheck = ssh -i $RSA_PATH -p 20127 "$USER@ieticloudpro.ieti.cat" "$checkCommand"

if ($remoteCheck -eq "EXISTS") {
    $response = Read-Host "El fitxer ja existeix. Vols sobreescriure'l? (s/n)"
    if ($response -ne "s") {
        Write-Host "Cancel·lat per l'usuari."
        exit 0
    }
}

# Upload with scp
scp -i $RSA_PATH -P 20127 "$LOCAL_FILE" "$USER@ieticloudpro.ieti.cat:$REMOTE_PATH"

Write-Host "Fitxer pujat correctament."
