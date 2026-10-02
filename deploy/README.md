# Production deploy: app.asapchop.com

Pushes to `main` run `.github/workflows/deploy-production.yml`. It builds the site on GitHub, uploads
it to `traitz-prod-01` (2.24.162.111) and restarts the `asapchop-web` service. nginx proxies
`app.asapchop.com` to it on `127.0.0.1:3100`.

```
/opt/traitz/apps/asapchop-web/
├── current -> releases/20261002120000-abc1234   (live release, switched on each deploy)
├── releases/                                     (last 5 kept)
└── shared/runtime.env                            (server-only settings)
```

## One-time server setup (as `junior`)

1. Node.js (only the runtime is needed, no yarn):
   `sudo apt install -y nodejs && node -v` (needs 20 or newer)
2. App user and folders:
   ```bash
   sudo adduser --system --group --shell /bin/bash --home /opt/traitz/apps/asapchop-web asapchop-web
   sudo usermod -aG systemd-journal asapchop-web
   sudo -u asapchop-web mkdir -p /opt/traitz/apps/asapchop-web/{releases,shared}
   ```
3. `shared/runtime.env` from `runtime.env.example`, owned by `asapchop-web`, mode 600.
4. systemd unit: copy `asapchop-web.service` to `/etc/systemd/system/`, then
   `sudo systemctl daemon-reload && sudo systemctl enable asapchop-web`.
   (It can't start until the first release exists.)
5. sudo rule: `sudo visudo -cf asapchop-web.sudoers && sudo install -m 440 asapchop-web.sudoers /etc/sudoers.d/asapchop-web`
6. Deploy key: generate a key pair locally, put the public key in
   `/opt/traitz/apps/asapchop-web/.ssh/authorized_keys` (dir 700, file 600, owned by `asapchop-web`).
7. GitHub repo → Settings → Environments → `production`:
   - Secrets: `PROD_SSH_KEY` (private key), `PROD_KNOWN_HOSTS` (`ssh-keyscan -p 22 2.24.162.111`)
   - Variables: `NEXT_PUBLIC_BASE_URL`, `NEXT_CLIENT_HOST_URL`, `NEXT_PUBLIC_GOOGLE_MAP_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_SITE_VERSION`
   - Deployment branches: `main` only
8. DNS: `A app → 2.24.162.111`.
9. nginx: copy `app.asapchop.com.nginx.conf` to `/etc/nginx/sites-available/asapchop-web`, symlink into
   `sites-enabled`, `sudo nginx -t && sudo systemctl reload nginx`, then
   `sudo certbot --nginx -d app.asapchop.com`.

## Day to day

- Logs: `sudo journalctl -u asapchop-web -f`
- Status: `systemctl status asapchop-web`
- Manual rollback (as `asapchop-web`):
  ```bash
  cd /opt/traitz/apps/asapchop-web && ls releases
  ln -sfn releases/<older-release> current.tmp && mv -T current.tmp current
  sudo systemctl restart asapchop-web
  ```
- Switching the API (e.g. `https://vps.asapchop.com` → `https://asapchop.com` at cutover):
  1. GitHub → Settings → Environments → `production` → Variables → edit `NEXT_PUBLIC_BASE_URL`.
  2. On the server, edit the same line in `shared/runtime.env`.
  3. GitHub → Actions → "Deploy to app.asapchop.com (production)" → Run workflow (branch `main`).
     The rebuild picks up the new value and the restart reloads `runtime.env`.
- Changing a `NEXT_PUBLIC_*` value: update the GitHub variable and re-run the workflow. These values are
  baked in at build time, so editing them on the server does nothing for the browser.
