import http.server
import socketserver
import webbrowser
import json
import csv
import os
from datetime import datetime

PORT = 8000
SCORE_FILE = "scores.csv"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/submit-score':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                name = data.get('name', 'Unknown')
                score = data.get('score', 0)
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Save to CSV
                file_exists = os.path.isfile(SCORE_FILE)
                with open(SCORE_FILE, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    if not file_exists:
                        writer.writerow(['Timestamp', 'Name', 'Score'])
                    writer.writerow([timestamp, name, score])
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Score saved"}).encode())
                print(f"Saved score: {name} - {score}")
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                print(f"Error saving score: {e}")
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(302)
            self.send_header('Location', 'http://localhost:3000')
            self.end_headers()
        else:
            super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# Ensure correct MIME types
CustomHandler.extensions_map.update({
    ".js": "application/javascript",
    ".css": "text/css",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
})

print(f"Starting server at http://localhost:{PORT}")
print(f"Scores will be saved to {os.path.abspath(SCORE_FILE)}")

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    # webbrowser.open(f"http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
