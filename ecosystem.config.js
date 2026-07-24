module.exports = {
  apps: [
    {
      name: "buscador-api",
      script: "apps/api/dist/main.js",
      cwd: "./",
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
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5279",
      cwd: "./apps/web",
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
