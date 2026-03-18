# Server Setup Guide — Hetzner CX33

Deploy the SimCraft Runner on a Hetzner CX33 (3 vCPU, 8GB RAM, Ubuntu).

---

## 1. SSH into your server

Hetzner emails you the IP after purchase.

```bash
ssh root@YOUR_SERVER_IP
```

## 2. Install Docker and Git

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y git
```

## 3. Create a deploy user (recommended)

```bash
adduser deploy
usermod -aG docker deploy
su - deploy
```

## 4. Clone the project

```bash
cd ~
git clone https://github.com/sortbek/simcraft.git
// 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
git clone https://sortbek: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@github.com/sortbek/simcraft.git
cd simcraft
```

> If the repo isn't on GitHub yet, push it from your local machine first:
>
> ```bash
> cd C:\Users\Jeffrey\raidbots-clone
> git init
> git add -A
> git commit -m "Initial commit"
> git remote add origin https://github.com/YOUR_USERNAME/raidbots-clone.git
> git push -u origin main
> ```

## 5. Create the environment file

```bash
cp .env.example .env
nano .env
```

Set these values:

```env
REDIS_URL=redis://redis:6379
SIMC_PATH=/usr/local/bin/simc
DATABASE_URL=sqlite+aiosqlite:///./raidbots.db
CORS_ORIGINS=["http://YOUR_SERVER_IP:3000"]
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
```

## 6. Build and start

```bash
docker compose up -d --build
```

The first build takes **10-15 minutes** because SimC compiles from source.

Check that everything is running:

```bash
docker compose ps
docker compose logs -f
```

The app is now live at **http://YOUR_SERVER_IP:3000**

---

## 7. Set up a domain with HTTPS (optional)

### DNS

Point your domain's **A record** to your server IP in your DNS provider.

### Install Caddy

```bash
# Run as root
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

### Configure Caddy

```bash
nano /etc/caddy/Caddyfile
```

```
yourdomain.com {
    handle /api/* {
        reverse_proxy localhost:8000
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

```bash
systemctl restart caddy
```

Caddy automatically provisions a Let's Encrypt SSL certificate.

### Update the environment

```bash
nano ~/raidbots-clone/.env
```

```env
CORS_ORIGINS=["https://yourdomain.com"]
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

Restart the containers:

```bash
cd ~/raidbots-clone
docker compose down
docker compose up -d
```

The app is now live at **https://yourdomain.com**

---

## 8. Auto-restart on reboot

Add `restart: unless-stopped` to every service in `docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    # ...

  backend:
    build: ./backend
    restart: unless-stopped
    # ...

  worker:
    build: ./backend
    restart: unless-stopped
    # ...

  frontend:
    build: ./frontend
    restart: unless-stopped
    # ...
```

---

## Useful commands

| Task | Command |
|------|---------|
| View all logs | `docker compose logs -f` |
| View specific service | `docker compose logs -f worker` |
| Rebuild after code changes | `git pull && docker compose up -d --build` |
| Restart everything | `docker compose restart` |
| Stop everything | `docker compose down` |
| Check running containers | `docker compose ps` |
| Check disk usage | `df -h` |
| Check memory usage | `free -h` |
| Check Docker disk usage | `docker system df` |
| Clean up old images | `docker system prune -af` |

---

## Architecture on the server

```
Internet
  │
  ├─ :443 (HTTPS) ──▶ Caddy ──▶ :3000 (Next.js frontend)
  │                         └──▶ :8000 (FastAPI backend)
  │
  └─ Docker Compose
       ├── redis        (job queue)
       ├── backend      (FastAPI API)
       ├── worker       (ARQ + SimC)
       └── frontend     (Next.js)
```

---

## Troubleshooting

**Build fails during SimC compilation:**
The CX33 has enough RAM (8GB) for SimC compilation. If it still fails, add swap:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Frontend can't reach backend:**
Make sure `NEXT_PUBLIC_API_URL` in `.env` matches your actual URL (IP or domain). This value is baked into the frontend at build time, so you need to rebuild after changing it:

```bash
docker compose up -d --build frontend
```

**Caddy won't start:**
Check that ports 80 and 443 are open in the Hetzner firewall (Cloud Console > Firewalls). Caddy needs both for the ACME challenge.

**Database reset:**
The SQLite database lives inside the backend container volume. To reset:

```bash
docker compose down -v
docker compose up -d
```
