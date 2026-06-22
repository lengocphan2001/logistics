module.exports = {
  apps: [
    {
      name: 'logistics-backend',
      script: 'dist/src/main.js',
      cwd: '/var/www/logistics/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'logistics-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/logistics/admin',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'logistics-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/logistics/frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
