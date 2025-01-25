from flask import Flask, request, jsonify, send_file, Response, render_template  # 添加 render_template
import torch
import torchaudio
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import io
import os
import transformers
import logging
import sys
from werkzeug.serving import WSGIRequestHandler
import socket
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
import json
import time
from pathlib import Path
import redis

# from speechbrain.inference.TTS import Tacotron2
# from speechbrain.inference.vocoders import HIFIGAN
from pydub import AudioSegment
import string

import all_function as af


text_redis = redis.Redis(host='localhost', port=6379, db=0)

ja_text_redis = redis.Redis(host='localhost', port=6379, db=1)

# 设置环境
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

# os.environ['CURL_CA_BUNDLE'] = ''
os.environ['CURL_CA_BUNDLE'] = ''
# os.environ['REQUESTS_CA_BUNDLE'] = ''


# 设置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 自定义请求处理器
class CustomRequestHandler(WSGIRequestHandler):
    def handle(self):
        try:
            logger.info(f"收到新的连接请求: {self.client_address}")
            super().handle()
        except socket.timeout:
            logger.error(f"连接超时: {self.client_address}")
        except ConnectionError as e:
            logger.error(f"连接错误: {self.client_address}, 错误: {e}")
        except Exception as e:
            logger.error(f"处理请求时发生错误: {self.client_address}, 错误: {e}")
    
    def handle_error(self):
        logger.error(f"请求处理错误: {self.client_address}", exc_info=True)

# 修改Flask初始化代码
app = Flask(__name__, 
    static_folder='/workspace/yasi/UI/static',
    template_folder='/workspace/yasi/UI/templates'
)
CORS(app)

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

@app.before_request
def log_request_info():
    logger.info('请求头信息:')
    logger.info(f'Path: {request.path}')
    logger.info(f'Method: {request.method}')
    logger.info(f'Headers: {dict(request.headers)}')
    logger.info(f'Client IP: {request.remote_addr}')

@app.after_request
def log_response_info(response):
    logger.info(f'响应状态: {response.status}')
    logger.info(f'响应头: {dict(response.headers)}')
    return response

@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self' * data: blob:; "  # 放宽限制
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline'; "
        "media-src 'self' blob: *; "
        "worker-src 'self' blob: *; "
    )
    return response

# 添加路由处理首页
@app.route('/')
def index():
    logger.info(f"收到首页请求: scheme={request.scheme}, host={request.host}")
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"渲染页面错误: {e}", exc_info=True)
        return str(e), 500