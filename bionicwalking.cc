server {
    listen 80;
    listen [::]:80;
    server_name bionicwalking.cc;

    # 添加访问日志和错误日志
    access_log /var/log/nginx/bionicwalking.access.log;
    error_log /var/log/nginx/bionicwalking.error.log debug;

    # 处理 /en_resume 路径下的所有请求
    location /en_resume {
        proxy_pass http://localhost:8080;
        
        # 基本代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 添加 CORS 头
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

        # 超时设置
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
        proxy_read_timeout 60;

        # 缓冲区设置
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;

        # 错误处理
        proxy_intercept_errors on;
        error_page 502 503 504 /50x.html;
    }

    # 处理静态文件的特殊配置
    location ~ ^/en_resume/.*\.(css|js|jpg|png|gif)$ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 添加缓存控制
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # 错误页面位置
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}