# Ultrasound Report System

This is a [Next.js](https://nextjs.org) project for managing ultrasound reports in outpatient clinics.

## Features

- User authentication with role-based access (Admin, Doctor, Nurse)
- Patient management system
- Ultrasound report creation and management
- Image upload and storage
- Report printing functionality
- Search and filter capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd martclinic-dev
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/martclinic"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Create the database
sudo -u postgres createdb martclinic

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
node prisma/seed.js
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The database includes the following main tables:

- **User**: Contains user information with roles (ADMIN, DOCTOR, NURSE)
- **Patient**: Contains patient information including personal and medical history
- **Report**: Contains medical reports linked to patients and doctors

## Seed Data

The database comes pre-populated with the following seed data:

- 3 users with different roles:
  - Doctor (email: doctor@example.com, password: password)
  - Nurse (email: nurse@example.com, password: password)
  - Admin (email: admin@example.com, password: password)
- 5 sample patients with random data
- 20 sample reports linked to the patients

To reset the database with seed data:
```bash
npx prisma migrate reset
node prisma/seed.js
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Option 1: Vercel Deployment
The application can be deployed on Vercel or any other platform that supports Next.js applications.

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

### Option 2: Nginx Deployment

#### Prerequisites
- Ubuntu/Debian server
- Node.js (v18 or higher)
- PostgreSQL
- Nginx
- PM2 (for process management)

#### Installation Steps

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Install PM2 globally:
```bash
npm install -g pm2
```

3. Build the application:
```bash
npm run build
```

4. Create a systemd service file for the Next.js application:
```bash
sudo nano /etc/systemd/system/martclinic.service
```

Add the following content:
```ini
[Unit]
Description=MartClinic Next.js Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/martclinic-dev
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

5. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/martclinic
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase max upload size
    client_max_body_size 10M;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_min_length 1000;

    # Cache static assets
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_valid 60m;
        proxy_cache_bypass $http_upgrade;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

6. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/martclinic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. Start the application service:
```bash
sudo systemctl start martclinic
sudo systemctl enable martclinic
```

8. Set up SSL with Let's Encrypt (Optional but recommended):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Environment Setup

Create a production `.env` file:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/martclinic"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

#### Maintenance

- View logs:
```bash
sudo journalctl -u martclinic
```

- Restart the application:
```bash
sudo systemctl restart martclinic
```

- Update the application:
```bash
git pull
npm install
npm run build
sudo systemctl restart martclinic
```

#### Security Considerations

1. Configure firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. Set up regular backups:
```bash
# Backup database
pg_dump martclinic > backup.sql

# Backup application files
tar -czf martclinic-backup.tar.gz /path/to/martclinic-dev
```

3. Keep dependencies updated:
```bash
npm audit
npm update
```

#### Additional Nginx Configuration

1. Optimize Nginx for Next.js:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase max upload size
    client_max_body_size 10M;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_min_length 1000;

    # Cache static assets
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_valid 60m;
        proxy_cache_bypass $http_upgrade;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

2. Configure PM2 for better process management:
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add the following configuration:
```javascript
module.exports = {
  apps: [{
    name: 'martclinic',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Troubleshooting

1. Check application logs:
```bash
# PM2 logs
pm2 logs martclinic

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u martclinic -f
```

2. Common issues and solutions:

a. Application not starting:
```bash
# Check if port 3000 is in use
sudo lsof -i :3000

# Check application status
pm2 status
sudo systemctl status martclinic
```

b. Nginx 502 Bad Gateway:
```bash
# Check if application is running
curl http://localhost:3000

# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

c. Database connection issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U postgres -d martclinic -c "\l"
```

#### Performance Optimization

1. Enable Nginx caching:
```bash
# Create cache directory
sudo mkdir -p /var/cache/nginx
sudo chown www-data:www-data /var/cache/nginx

# Add to nginx.conf
sudo nano /etc/nginx/nginx.conf
```

Add to http block:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
```

2. Configure Node.js memory limits:
```bash
# Add to systemd service file
Environment=NODE_OPTIONS="--max-old-space-size=2048"
```

3. Set up monitoring:
```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

#### Backup and Restore

1. Automated backup script:
```bash
#!/bin/bash
# Save as backup.sh

# Set variables
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="martclinic"
APP_DIR="/path/to/martclinic-dev"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz $APP_DIR

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

2. Restore from backup:
```bash
# Restore database
psql -U postgres -d martclinic < backup.sql

# Restore application files
tar -xzf app_backup.tar.gz -C /path/to/restore
```

#### Security Hardening

1. Configure SSL with stronger settings:
```nginx
# Add to server block
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000" always;
```

2. Set up fail2ban:
```bash
sudo apt install fail2ban
sudo nano /etc/fail2ban/jail.local
```

Add configuration:
```ini
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
```

3. Regular security updates:
```bash
# Create update script
#!/bin/bash
# Save as update.sh

# Update system
sudo apt update
sudo apt upgrade -y

# Update Node.js dependencies
cd /path/to/martclinic-dev
npm audit fix
npm update

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
