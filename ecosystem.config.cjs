module.exports = {
  apps: [
    {
      name: "pagina-shigueno",
      script: "dist/server.cjs",
      cwd: "/var/www/pagina-shigueno",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/log/pm2/pagina-shigueno-error.log",
      out_file: "/var/log/pm2/pagina-shigueno-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
