#!/bin/bash

# 日志文件
LOG_FILE="deploy.log"

# 输出时间戳的日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 错误处理函数
handle_error() {
    log "错误: $1"
    exit 1
}

# 开始拉去代码
log "开始拉取代码..."
git pull
# 开始部署
log "开始部署..."

# 安装依赖
log "正在安装依赖..."
npm install || handle_error "npm install 失败"

# 构建项目
log "正在构建项目..."
npm run build || handle_error "构建失败"

# 使用 pm2 重启或启动项目
log "正在启动/重启服务..."
pm2 restart daily-news || pm2 start ecosystem.config.cjs || handle_error "PM2 启动失败"

log "部署完成!"
