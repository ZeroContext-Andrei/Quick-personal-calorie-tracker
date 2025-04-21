import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "." # Serve files from the current directory

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

# Ensure the server binds to localhost (127.0.0.1) for security
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Serving files from directory: {os.path.abspath(DIRECTORY)}")
    print(f"Serving at http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.shutdown() 