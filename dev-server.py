from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import threading
import time

ROOT = Path(__file__).parent
clients = []
clients_lock = threading.Lock()
last_change = 0.0


def snapshot():
    files = [ROOT / name for name in ("index.html", "styles.css", "script.js")]
    return max((path.stat().st_mtime_ns for path in files if path.exists()), default=0)


def watcher():
    global last_change
    previous = snapshot()
    while True:
        current = snapshot()
        if current != previous:
            previous = current
            last_change = time.time()
            with clients_lock:
                pending = clients[:]
                clients.clear()
            for connection in pending:
                try:
                    connection.write(b"data: reload\n\n")
                    connection.close()
                except OSError:
                    pass
        time.sleep(0.25)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/__events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            with clients_lock:
                clients.append(self.wfile)
            try:
                while True:
                    time.sleep(30)
                    self.wfile.write(b": keep-alive\n\n")
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                return
        if self.path == "/" or self.path.startswith("/index.html"):
            content = (ROOT / "index.html").read_text(encoding="utf-8")
            live_reload = "<script>new EventSource('/__events').onmessage=()=>location.reload();</script>"
            content = content.replace("</body>", live_reload + "</body>")
            encoded = content.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return
        super().do_GET()


if __name__ == "__main__":
    threading.Thread(target=watcher, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", 5500), Handler)
    print("Live server: http://127.0.0.1:5500")
    server.serve_forever()
