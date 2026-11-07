#!/usr/bin/env python3
"""FeelInk relay: serves the two pages, relays drawing events and logs test results. Stdlib only.

Usage: python feelink/server.py [port]
Anyone on the same network can open these pages, so run it only while testing.
"""
import json
import queue
import socket
import sys
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).parent
PAGES = {
    "/": ("feel.html", "text/html"),
    "/feel": ("feel.html", "text/html"),
    "/draw": ("draw.html", "text/html"),
    "/tactile.js": ("tactile.js", "text/javascript"),
}


class Relay:
    def __init__(self):
        self.lock = threading.Lock()
        self.strokes = {}  # id -> stroke, insertion-ordered, so undo pops the newest
        self.clients = []

    def subscribe(self):
        q = queue.Queue()
        with self.lock:
            self.clients.append(q)
            q.put({"type": "sync", "strokes": list(self.strokes.values())})
        return q

    def unsubscribe(self, q):
        with self.lock:
            self.clients.remove(q)

    def publish(self, event):
        with self.lock:
            kind = event.get("type")
            if kind == "stroke":
                self.strokes[event["id"]] = {"id": event["id"], "by": event.get("by"), "pts": event["pts"]}
            elif kind == "clear":
                self.strokes.clear()
            elif kind == "undo" and self.strokes:
                self.strokes.pop(next(reversed(self.strokes)))
            for q in self.clients:
                q.put(event)
            if kind == "undo":
                sync = {"type": "sync", "strokes": list(self.strokes.values())}
                for q in self.clients:
                    q.put(sync)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    relay = Relay()
    results_path = HERE / "results.jsonl"

    def log_message(self, *args):
        pass

    def reply(self, code, body=b"", ctype="text/plain"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/events":
            return self.stream()
        page = PAGES.get(self.path.split("?")[0])
        if not page:
            return self.reply(404, b"not found")
        self.reply(200, (HERE / page[0]).read_bytes(), page[1] + "; charset=utf-8")

    def do_POST(self):
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        except (ValueError, TypeError):
            return self.reply(400, b"bad json")
        if self.path == "/event":
            self.relay.publish(body)
        elif self.path == "/log":
            body["at"] = datetime.now().isoformat(timespec="seconds")
            with open(self.results_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(body) + "\n")
        else:
            return self.reply(404, b"not found")
        self.reply(200, b"ok")

    def stream(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True
        q = self.relay.subscribe()
        try:
            while True:
                try:
                    data = f"data: {json.dumps(q.get(timeout=10))}\n\n"
                except queue.Empty:
                    data = ": keepalive\n\n"
                self.wfile.write(data.encode())
                self.wfile.flush()
        except OSError:
            pass
        finally:
            self.relay.unsubscribe(q)


def lan_addresses():
    try:
        return sorted({a[4][0] for a in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)})
    except OSError:
        return []


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Laptop canvas: http://localhost:{port}/draw")
    for ip in lan_addresses():
        print(f"Pixel, in Chrome: http://{ip}:{port}/feel")
    server.serve_forever()


if __name__ == "__main__":
    main()
