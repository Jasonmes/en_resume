from flask import Flask, send_from_directory, send_file, current_app, make_response
from flask_cors import CORS
import os
import logging
import mimetypes

# 设置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 获取当前文件所在目录的绝对路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 创建 Flask 应用
app = Flask(__name__, static_folder=None)
# 启用 CORS
CORS(app, resources={r"/en_resume/*": {"origins": "*"}})

@app.route('/en_resume/')
@app.route('/en_resume')
def index():
    try:
        file_path = os.path.join(BASE_DIR, 'index.html')
        logger.debug(f"Serving index.html from: {file_path}")
        
        if not os.path.exists(file_path):
            logger.error(f"index.html not found at: {file_path}")
            return make_response(("File not found", 404))
            
        return send_file(
            file_path,
            mimetype='text/html',
            download_name='index.html'
        )
    except Exception as e:
        logger.error(f"Error serving index: {str(e)}")
        return make_response(("Internal Server Error", 500))

@app.route('/en_resume/<path:filename>')
def serve_static(filename):
    try:
        file_path = os.path.join(BASE_DIR, filename)
        logger.debug(f"Requested file: {filename}")
        logger.debug(f"Full path: {file_path}")
        
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {file_path}")
            return make_response(("File not found", 404))
            
        # 获取正确的 MIME 类型
        content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            if filename.endswith('.css'):
                content_type = 'text/css'
            elif filename.endswith('.js'):
                content_type = 'application/javascript'
            elif filename.endswith('.html'):
                content_type = 'text/html'
            else:
                content_type = 'application/octet-stream'
        
        try:
            response = send_file(
                file_path,
                mimetype=content_type,
                download_name=filename
            )
            
            # 添加缓存控制
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            
            logger.debug(f"Serving {filename} with Content-Type: {content_type}")
            return response
        except Exception as e:
            logger.error(f"Error reading file {filename}: {str(e)}")
            return make_response(("Internal Server Error", 500))
            
    except Exception as e:
        logger.error(f"Error serving {filename}: {str(e)}")
        return make_response(("Internal Server Error", 500))

@app.after_request
def after_request(response):
    # 如果响应没有明确设置的Content-Type，设置一个默认值
    if not response.headers.get('Content-Type'):
        response.headers['Content-Type'] = 'text/plain'
        
    # CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

if __name__ == '__main__':
    logger.info(f'Starting server...')
    logger.info(f'Current working directory: {BASE_DIR}')
    logger.info(f'Directory contents: {os.listdir(BASE_DIR)}')
    app.run(host='0.0.0.0', port=8080, debug=True)