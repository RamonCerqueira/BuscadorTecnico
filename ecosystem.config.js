const path = require('path');

module.exports = {
  apps: [
    {
      name: "buscador-api",
      script: "dist/main.js",
      cwd: path.resolve(__dirname, "apps/api"),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5278
      }
    },
    {
      name: "buscador-web",
      script: path.resolve(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -p 5279",
      cwd: path.resolve(__dirname, "apps/web"),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5279
      }
    }
  ]
};
