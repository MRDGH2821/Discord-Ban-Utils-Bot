module.exports = {
  apps: [
    {
      env_dev: {
        NODE_ENV: 'dev'
      },
      env_prod: {
        NODE_ENV: 'prod'
      },
      name: 'Ban Utils Bot',
      script: 'index.js',
      watch: true
    },
    {
      autorestart: false,
      name: 'Deploy BU Bot',
      script: './deploy-check.js',
      watch: false
    }
  ]
};
