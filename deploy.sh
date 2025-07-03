#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="martclinic"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="martclinic.duckdns.org"
DB_NAME="martclinic"
DB_USER="postgres"
DB_PASSWORD="han@6578279"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if this is initial deployment or update
if [ ! -d "$APP_DIR" ] || [ ! -d "$APP_DIR/.git" ]; then
    echo -e "${GREEN}Initial deployment detected. Setting up fresh installation...${NC}"
    DEPLOYMENT_TYPE="initial"
else
    echo -e "${GREEN}Update deployment detected. Updating existing installation...${NC}"
    DEPLOYMENT_TYPE="update"
fi

if [ "$DEPLOYMENT_TYPE" = "initial" ]; then
    echo -e "${GREEN}Starting initial deployment process...${NC}"
    
    # Update system
    echo -e "${GREEN}Updating system...${NC}"
    sudo apt update
    sudo apt upgrade -y
    
    # Install required packages
    echo -e "${GREEN}Installing required packages...${NC}"
    sudo apt install -y nginx postgresql postgresql-contrib nodejs npm certbot python3-certbot-nginx
    
    # Install Node.js 18.x
    echo -e "${GREEN}Installing Node.js 18.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2 globally
    echo -e "${GREEN}Installing PM2...${NC}"
    sudo npm install -g pm2
    
    # Create application directory
    echo -e "${GREEN}Creating application directory...${NC}"
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    
    # Clone repository
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone https://github.com/hanyusok/martclinic-dev.git $APP_DIR
    
    # Create production environment file
    echo -e "${GREEN}Creating environment file...${NC}"
    cat > $APP_DIR/.env << EOL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://$DOMAIN"
EOL
    
    # Set up PostgreSQL
    echo -e "${GREEN}Setting up PostgreSQL...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || true
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    
    # Create PM2 ecosystem file
    echo -e "${GREEN}Creating PM2 configuration...${NC}"
    cat > $APP_DIR/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
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
EOL
    
    # Create Nginx configuration
    echo -e "${GREEN}Creating Nginx configuration...${NC}"
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOL
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 10M;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_min_length 1000;
    
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_valid 60m;
        proxy_cache_bypass \$http_upgrade;
        add_header X-Cache-Status \$upstream_cache_status;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOL
    
    # Enable the site
    echo -e "${GREEN}Enabling Nginx site...${NC}"
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    echo -e "${GREEN}Testing Nginx configuration...${NC}"
    sudo nginx -t
    sudo systemctl restart nginx
    
    # Set up PM2 startup
    echo -e "${GREEN}Setting up PM2 startup...${NC}"
    NODE_PATH=$(which node)
    PM2_PATH=$(which pm2)
    sudo env PATH=$PATH:$NODE_PATH $PM2_PATH startup systemd -u $USER --hp $HOME
    
    # Set up SSL with Let's Encrypt
    echo -e "${GREEN}Setting up SSL...${NC}"
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email hanyusok@gmail.com
    
    # Create backup script
    echo -e "${GREEN}Creating backup script...${NC}"
    cat > $APP_DIR/backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/var/backups/$APP_NAME"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR
pg_dump $DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz $APP_DIR
find \$BACKUP_DIR -type f -mtime +30 -delete
EOL
    chmod +x $APP_DIR/backup.sh
    
    # Set up cron job for backups
    echo -e "${GREEN}Setting up backup cron job...${NC}"
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
fi

# Common deployment steps (both initial and update)
echo -e "${GREEN}Deploying application...${NC}"

# Navigate to application directory
cd $APP_DIR

# Pull latest code (for updates) or install dependencies (for initial)
if [ "$DEPLOYMENT_TYPE" = "update" ]; then
    echo -e "${GREEN}Pulling latest code...${NC}"
    git pull
fi

echo -e "${GREEN}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}Running database migrations...${NC}"
npx prisma migrate deploy

echo -e "${GREEN}Building the application...${NC}"
npm run build

# Start or restart the application with PM2
if [ "$DEPLOYMENT_TYPE" = "initial" ]; then
    echo -e "${GREEN}Starting application with PM2...${NC}"
    pm2 start ecosystem.config.js
    pm2 save
else
    echo -e "${GREEN}Restarting application with PM2...${NC}"
    pm2 restart $APP_NAME
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is now running at https://$DOMAIN${NC}"
echo -e "${GREEN}To check the status, run: pm2 status${NC}"
echo -e "${GREEN}To view logs, run: pm2 logs $APP_NAME${NC}" 