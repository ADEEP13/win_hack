module.exports = {
  apps: [
    {
      name: "jandhan-next",
      script: "npm",
      args: "start",
      cwd: "/var/www/jandhan-plus",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/var/www/jandhan-plus/logs/next-error.log",
      out_file: "/var/www/jandhan-plus/logs/next-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "jandhan-voice",
      script: "/var/www/jandhan-plus/backend/voice-api.js",
      interpreter: "node",
      instances: 1,
      env: {
        NODE_ENV: "production",
        VOICE_API_PORT: 4000,
      },
      error_file: "/var/www/jandhan-plus/logs/voice-error.log",
      out_file: "/var/www/jandhan-plus/logs/voice-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "jandhan-ai",
      script: "/var/www/jandhan-plus/backend/ai-service.py",
      interpreter: "python3",
      instances: 1,
      env: {
        FLASK_ENV: "production",
        FLASK_APP: "ai-service.py",
      },
      error_file: "/var/www/jandhan-plus/logs/ai-error.log",
      out_file: "/var/www/jandhan-plus/logs/ai-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "your-server-ip",
      ref: "origin/main",
      repo: "https://github.com/your-team/jandhan-plus.git",
      path: "/var/www/jandhan-plus",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
