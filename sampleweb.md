Web服务部署指南
1. 基础环境准备

# 更新系统
sudo apt update
sudo apt upgrade

# 安装必要的软件
sudo apt install nginx python3-pip python3-venv git git-lfs

2. 初始 Nginx 配置
创建基础的 Nginx 配置文件：
server {
    listen 80;
    server_name bionicwalking.cc;

    location /en_resume/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
应用配置：
sudo cp bionicwalking.cc /etc/nginx/sites-available/
sudo cp /etc/nginx/sites-available/bionicwalking.cc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
3. VPS 防火墙设置
# 开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# 检查防火墙状态
sudo ufw status

4. 域名设置
在域名管理平台添加 A 记录：
主机记录：@
记录类型：A
记录值：[你的服务器IP]
TTL：3600
验证域名解析：dig bionicwalking.cc
5. SSL 证书配置
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d bionicwalking.cc

6. 更新 Nginx 配置（包含 SSL）
server {
    listen 443 ssl;
    server_name bionicwalking.cc;

    ssl_certificate /etc/letsencrypt/live/bionicwalking.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bionicwalking.cc/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # 全局设置最大文件大小
    client_max_body_size 100M;

    # 添加视频文件的 MIME 类型和大文件支持
    location ~* \.(mp4|webm)$ {
        add_header Content-Type "video/mp4";
        add_header Accept-Ranges bytes;
        client_max_body_size 100M;
        proxy_max_temp_file_size 100M;
        proxy_buffer_size 128k;
        proxy_buffers 32 128k;
    }

    location /en_resume/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        client_max_body_size 100M;
        proxy_max_temp_file_size 100M;
        proxy_buffer_size 128k;
        proxy_buffers 32 128k;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name bionicwalking.cc;
    return 301 https://$server_name$request_uri;
}

7. Flask 应用设置
创建虚拟环境：
cd ~/en_resume
python3 -m venv venv
source venv/bin/activate
安装依赖：
pip install flask flask-cors


标准 Flask 应用代码：
from flask import Flask, request, jsonify, send_file, Response, render_template
from flask_cors import CORS
import logging
import sys
from werkzeug.middleware.proxy_fix import ProxyFix

# 设置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, 
    static_folder='/path/to/your/static',
    template_folder='/path/to/your/templates'
)
CORS(app)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

@app.before_request
def log_request_info():
    logger.info('Headers: %s', dict(request.headers))

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)


创建系统服务：
sudo nano /etc/systemd/system/en-resume.service

[Unit]
Description=English Resume Flask Application
After=network.target

[Service]
User=root
WorkingDirectory=/root/en_resume
Environment="PATH=/root/en_resume/venv/bin"
ExecStart=/root/en_resume/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

启动服务：
sudo systemctl daemon-reload
sudo systemctl start en-resume
sudo systemctl enable en-resume

Git LFS 设置（用于大文件）
# 安装 Git LFS
sudo apt install git-lfs

# 进入项目目录
cd ~/en_resume

# 初始化 Git LFS
git lfs install

# 拉取 LFS 文件
git lfs pull


9. 检查和维护
检查服务状态：
sudo systemctl status nginx
sudo systemctl status en-resume
查看日志：
sudo journalctl -u nginx
sudo journalctl -u en-resume
测试网站访问：
curl -I https://bionicwalking.cc/en_resume/