module.exports = {
  apps: [
    {
      name: 'moobeChat',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/moobeChat',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/moobeChat-error.log',
      out_file: '/var/log/pm2/moobeChat-out.log',
      log_file: '/var/log/pm2/moobeChat-combined.log',
      time: true
    },
    {
      name: 'moobeChat-mcp',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/moobeChat/mcp-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/moobeChat-mcp-error.log',
      out_file: '/var/log/pm2/moobeChat-mcp-out.log',
      log_file: '/var/log/pm2/moobeChat-mcp-combined.log',
      time: true
    }
  ]
};