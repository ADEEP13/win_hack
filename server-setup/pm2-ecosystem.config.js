module.exports = {
  apps: [
    {
      name: "jandhan-next",
      script: "npm",
      args: "start",
      cwd: "/home/adeep/jandhan-plus",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "jandhan-voice",
      script: "/home/adeep/jandhan-plus/backend/voice-api.js",
      interpreter: "node",
      instances: 1,
      env: {
        NODE_ENV: "production",
        VOICE_API_PORT: 4000,
      },
    },
  ],
};
