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
        proxy_pass http://127.0.0.1:8080/en_resume/;
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

    location /ch_resume/ {
        proxy_pass http://127.0.0.1:8080/ch_resume/;
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