# Offline Ghost backup (before DNS / ECS release)

Run on the Aliyun ECS host while Ghost still works. Store results **off the VPS** (laptop, object storage). Never commit dumps or tokens to Git.

## 1. MySQL dump

```bash
# Adjust user/db names to match /var/www/yuehai config
set +H   # avoid bash history expansion truncating passwords with !
mysqldump -u ghost -p ghost_prod > "/tmp/ghost-$(date +%F).sql"
# Enter password interactively; then copy file off-box (scp/rsync)
```

## 2. Ghost content directory

```bash
sudo tar -C /var/www/yuehai -czf "/tmp/ghost-content-$(date +%F).tgz" content
# Copy /tmp/ghost-content-*.tgz off-box
```

## 3. Optional Admin JSON export

In Ghost Admin → Settings → Labs → Export your content. Download the JSON and keep with the dump/tarball.

## 4. Optional `ghost backup`

Needs a **Staff access token** from the Ghost profile page. Prefer steps 1–2 as the primary offline set.

## Checklist

- [ ] `.sql` dump downloaded and verified non-empty
- [ ] `content/` tarball downloaded
- [ ] Optional JSON export saved
- [ ] No backup files left world-readable on the VPS longer than needed
- [ ] Nothing from this checklist committed to `yuehai-site` or any public repo
