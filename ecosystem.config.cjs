module.exports = {
  apps: [{
    name: 'daily-news',
    cwd: __dirname,
    script: 'npm',
    args: 'start',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 2000,
    watch: false,
    time: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 6688
    }
  }]
}
