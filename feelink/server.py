#!/usr/bin/env python3
"""FeelInk relay: serves the two pages, relays drawing events and logs test results. Stdlib only.

Usage: python feelink/server.py [port]
       python -I feelink/server.py --selftest   offline check of the relay store
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
    "/stage": ("stage.html", "text/html"),
    "/board.js": ("board.js", "text/javascript"),
}


class Relay:
    def __init__(self):
        self.lock = threading.Lock()
        self.strokes = {}  # id -> stroke
        self.landmarks = {}  # id -> landmark (a named point), kept like strokes
        self.order = {}  # (type, id) in first-arrival order, so undo pops the newest stroke or landmark
        self.clients = []

    def sync(self):
        """The whole board, for a client that just joined or after an undo. Call with the lock held."""
        return {"type": "sync", "strokes": list(self.strokes.values()), "landmarks": list(self.landmarks.values())}

    def subscribe(self):
        q = queue.Queue()
        with self.lock:
            self.clients.append(q)
            q.put(self.sync())
        return q

    def unsubscribe(self, q):
        with self.lock:
            self.clients.remove(q)

    def publish(self, event):
        with self.lock:
            kind = event.get("type")
            if kind == "stroke":
                self.strokes[event["id"]] = {"id": event["id"], "by": event.get("by"), "pts": event["pts"]}
                self.order.setdefault(("stroke", event["id"]))
            elif kind == "landmark":
                self.landmarks[event["id"]] = {"id": event["id"], "x": event["x"], "y": event["y"],
                                               "name": event.get("name", ""), "by": event.get("by")}
                self.order.setdefault(("landmark", event["id"]))
            elif kind == "clear":
                self.strokes.clear()
                self.landmarks.clear()
                self.order.clear()
            elif kind == "undo" and self.order:
                (newest, item_id), _ = self.order.popitem()  # a dict pops its last-inserted key
                (self.strokes if newest == "stroke" else self.landmarks).pop(item_id)
            for q in self.clients:
                q.put(event)
            if kind == "undo":
                sync = self.sync()
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


def selftest():
    """Relay store: sync, clear and undo with strokes and landmarks mixed. No network."""
    relay = Relay()
    q = relay.subscribe()
    drain = lambda: [q.get_nowait() for _ in range(q.qsize())]
    ids = lambda: ([s["id"] for s in relay.strokes.values()], [m["id"] for m in relay.landmarks.values()])
    assert drain() == [{"type": "sync", "strokes": [], "landmarks": []}]

    s1 = {"type": "stroke", "id": "s1", "by": "tutor", "pts": [{"x": 5, "y": 37}, {"x": 5, "y": 83}]}
    lib = {"type": "landmark", "id": "m1", "x": 5, "y": 83, "name": "Library", "by": "tutor"}
    s2 = {"type": "stroke", "id": "s2", "by": "tutor", "pts": [{"x": 5, "y": 83}, {"x": 51, "y": 83}]}
    for ev in (s1, lib, s2):
        relay.publish(ev)
    assert drain() == [s1, lib, s2]  # relayed unchanged, in order
    stored = lambda ev: {k: v for k, v in ev.items() if k != "type"}
    assert relay.subscribe().get_nowait() == {"type": "sync", "strokes": [stored(s1), stored(s2)], "landmarks": [stored(lib)]}

    # A growing stroke and a renamed landmark are re-posted with the same id and keep their places.
    relay.publish({**s1, "pts": s1["pts"] + [{"x": 6, "y": 84}]})
    relay.publish({**lib, "name": "Main library"})
    assert ids() == (["s1", "s2"], ["m1"]) and relay.landmarks["m1"]["name"] == "Main library"
    drain()

    # Undo pops the newest item of either kind: s2, then the landmark, then s1.
    relay.publish({"type": "undo"})
    assert ids() == (["s1"], ["m1"])
    undo, sync = drain()
    assert undo == {"type": "undo"} and sync["type"] == "sync" and [m["id"] for m in sync["landmarks"]] == ["m1"]
    relay.publish({"type": "undo"})
    assert ids() == (["s1"], [])
    assert drain()[-1] == {"type": "sync", "strokes": [relay.strokes["s1"]], "landmarks": []}
    relay.publish({"type": "undo"})
    assert ids() == ([], [])
    relay.publish({"type": "undo"})  # nothing left: still relayed, no error
    assert ids() == ([], []) and drain()[-1] == {"type": "sync", "strokes": [], "landmarks": []}

    # Clear empties both, and leaves no stale order behind for the next undo.
    for ev in (lib, s1, {"type": "clear"}, s2):
        relay.publish(ev)
    assert ids() == (["s2"], [])
    relay.publish({"type": "undo"})
    assert ids() == ([], []) and not relay.order
    print("server selftest: ok")


def main():
    if sys.argv[1:] == ["--selftest"]:
        return selftest()
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Laptop canvas: http://localhost:{port}/draw")
    for ip in lan_addresses():
        print(f"Pixel, in Chrome: http://{ip}:{port}/feel")
    server.serve_forever()


if __name__ == "__main__":
    main()
