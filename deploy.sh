#!/bin/bash

# Laravel + Vite 部署脚本
# 在远程服务器上运行此脚本

echo "🚀 开始部署..."

# 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📋 安装/更新依赖..."
composer install --no-dev --optimize-autoloader
npm install

# 构建前端资源
echo "🔧 构建前端资源..."
npm run build

# 清理缓存
echo "🧹 清理缓存..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 优化应用
echo "⚡ 优化应用..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 数据库迁移（如果需要）
# php artisan migrate --force

echo "✅ 部署完成！"
echo "🌐 请刷新浏览器查看更新"