#!/bin/bash
# Run on Azure App Service SSH to create/sync the admin login user.
# Uses ADMIN_EMAIL and ADMIN_PASSWORD from Application settings.
set -e
cd /home/site/wwwroot
echo "Running migrations..."
npx prisma migrate deploy
echo "Seeding admin user..."
node prisma/seed.js
echo "Done. Restart the app from Azure portal, then sign in at /admin"
