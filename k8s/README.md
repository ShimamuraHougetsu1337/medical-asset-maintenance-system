# Minikube Deployment

This folder deploys the app as three workloads:

- `mysql`: MySQL 8.4 with a PVC.
- `backend`: Spring Boot API on port `8080`.
- `frontend`: Next.js app on port `3000`.

## Quick Deploy

Prerequisites:

- Docker Desktop is installed and running.
- `kubectl` is available.
- Minikube is installed and available in `PATH`.

On Windows, install Minikube with:

```powershell
winget install Kubernetes.minikube
```

Then reopen PowerShell so the updated `PATH` is loaded.

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\minikube-deploy.ps1
```

The script starts Minikube if needed, enables the ingress addon, builds both images inside Minikube's Docker daemon, and applies `kubectl apply -k k8s`.

## Manual Deploy

Start Minikube and enable ingress:

```powershell
minikube start
minikube addons enable ingress
```

Build images directly into Minikube:

```powershell
minikube docker-env --shell powershell | Invoke-Expression
docker build -t medical-asset-maintenance-backend:latest ./backend
docker build -t medical-asset-maintenance-frontend:latest --build-arg NEXT_PUBLIC_API_URL=/api --build-arg API_URL=http://backend:8080/api ./frontend
```

## Configure Secrets

Edit `secret.yaml` before deploying outside local development:

```yaml
stringData:
  mysql-root-password: change-me-root-password
  mysql-user: medical_user
  mysql-password: change-me-medical-password
  jwt-secret: change-me-to-a-strong-jwt-secret-at-least-32-chars
```

## Deploy

```powershell
kubectl apply -k k8s
kubectl -n medical-system get pods
```

## Access

Map the Minikube IP to `medical.local` in your hosts file:

```powershell
minikube ip
```

Example hosts entry:

```text
192.168.49.2 medical.local
```

Then open:

```text
http://medical.local
```

For quick local testing without Ingress:

```powershell
kubectl -n medical-system port-forward svc/frontend 3000:3000
```

Then open:

```text
http://localhost:3000
```

The frontend also rewrites `/api/*` to the internal backend service URL, so `port-forward` can be used for quick local checks.
