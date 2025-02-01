# 1. 备份原有配置（如有）
sudo cp /etc/nginx/sites-available/bionicwalking.conf /etc/nginx/sites-available/bionicwalking.conf.bak

# 2. 复制新配置
sudo cp path/to/your/bionicwalking.cc /etc/nginx/sites-available/bionicwalking.conf

# 3. 删除旧符号链接（如果存在）
sudo rm -f /etc/nginx/sites-enabled/bionicwalking.conf

# 4. 创建新符号链接
sudo ln -s /etc/nginx/sites-available/bionicwalking.conf /etc/nginx/sites-enabled/

# 5. 测试并应用配置
sudo nginx -t && sudo systemctl reload nginx

# 6. 检查服务状态
systemctl status nginx