from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Rota de saúde simples
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'TechFix API is running'})

# Servir arquivos estáticos (React build)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback para SPA routing
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("Starting TechFix API server...")
    app.run(host='0.0.0.0', port=5000, debug=False)

