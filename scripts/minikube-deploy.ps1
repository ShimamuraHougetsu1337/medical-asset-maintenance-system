param(
    [string]$Profile = "minikube",
    [string]$HostName = "medical.local"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Update-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $knownPaths = @(
        "C:\Program Files\Kubernetes\Minikube"
    )

    $pathParts = @($env:Path, $machinePath, $userPath) + $knownPaths
    $env:Path = ($pathParts | Where-Object { $_ } | Select-Object -Unique) -join [IO.Path]::PathSeparator
}

function Assert-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "Missing required command: $Name" -ForegroundColor Red
        Write-Host $InstallHint
        Write-Host ""
        exit 1
    }
}

Update-ProcessPath

Assert-Command "minikube" "Install Minikube, then reopen PowerShell. On Windows: winget install Kubernetes.minikube"
Assert-Command "kubectl" "Install kubectl or enable it from Docker Desktop Kubernetes."
Assert-Command "docker" "Install Docker Desktop and make sure Docker is running."

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host $Name
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Step failed: $Name"
    }
}

Write-Host "Using Minikube profile: $Profile"

$status = minikube -p $Profile status --format "{{.Host}}" 2>$null
if ($LASTEXITCODE -ne 0 -or $status -ne "Running") {
    Invoke-Step "Starting Minikube..." { minikube -p $Profile start }
}

Invoke-Step "Enabling ingress addon..." { minikube -p $Profile addons enable ingress }

Write-Host "Pointing Docker CLI at Minikube Docker daemon..."
minikube -p $Profile docker-env --shell powershell | Invoke-Expression

Invoke-Step "Building backend image..." {
    docker build -t medical-asset-maintenance-backend:latest (Join-Path $repoRoot "backend")
}

Invoke-Step "Building frontend image..." {
    docker build `
        -t medical-asset-maintenance-frontend:latest `
        --build-arg NEXT_PUBLIC_API_URL=/api `
        --build-arg API_URL=http://backend:8080/api `
        (Join-Path $repoRoot "frontend")
}

Invoke-Step "Applying Kubernetes manifests..." {
    kubectl apply -k (Join-Path $repoRoot "k8s")
}

Invoke-Step "Restarting app deployments to pick up local images..." {
    kubectl -n medical-system rollout restart deployment/backend deployment/frontend
}

Write-Host "Waiting for workloads..."
Invoke-Step "Waiting for mysql rollout..." { kubectl -n medical-system rollout status deployment/mysql --timeout=180s }
Invoke-Step "Waiting for backend rollout..." { kubectl -n medical-system rollout status deployment/backend --timeout=180s }
Invoke-Step "Waiting for frontend rollout..." { kubectl -n medical-system rollout status deployment/frontend --timeout=180s }

$minikubeIp = minikube -p $Profile ip

Write-Host ""
Write-Host "Deployment complete."
Write-Host "Add this hosts entry if it is not already present:"
Write-Host "$minikubeIp $HostName"
Write-Host ""
Write-Host "Then open: http://$HostName"
Write-Host ""
Write-Host "Quick checks:"
Write-Host "kubectl -n medical-system get pods"
Write-Host "kubectl -n medical-system get ingress"
