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
    "/dev": ("feel.html", "text/html"),  # same page with the test tools shown (#90)
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
        self.cleared = None  # the board as it was before the last clear, so one undo brings it back (Reeve, Nov 7)
        # The tutor's latest spoken instruction (#107), {id, text, by, heard?}. Only the newest is kept: it is what the
        # student should do now, and what a phone that joins late or reconnects is told.
        self.instruction = None
        self.clients = []

    def sync(self):
        """The whole board, for a client that just joined or after an undo. Call with the lock held."""
        out = {"type": "sync", "strokes": list(self.strokes.values()), "landmarks": list(self.landmarks.values())}
        if self.instruction:
            out["instruction"] = self.instruction  # absent when none, so older clients see the same sync as before
        return out

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
                mark = {"id": event["id"], "x": event["x"], "y": event["y"], "name": event.get("name", ""), "by": event.get("by")}
                if event.get("start"):
                    mark["start"] = True  # the tutor's start point (#107); re-posting the landmark without it unmarks it
                self.landmarks[event["id"]] = mark
                self.order.setdefault(("landmark", event["id"]))
            elif kind == "instruction":
                self.instruction = {"id": event.get("id"), "text": event.get("text", ""), "by": event.get("by")}
            elif kind == "spoken" and event.get("kind") == "instruction" and self.instruction \
                    and event.get("id") == self.instruction["id"]:
                # The phone finished saying it, so a stage that joins later shows it heard, not merely sent.
                # A new dict: a sync already queued for a client keeps the state it was built with.
                self.instruction = {**self.instruction, "heard": True}
            elif kind == "clear":
                # Clear empties the board, not the instruction (#107): what the student was asked to do still stands,
                # and the tutor often clears to redraw for that same instruction. Undo leaves it alone too.
                if self.order:
                    self.cleared = (dict(self.strokes), dict(self.landmarks), dict(self.order))
                self.strokes.clear()
                self.landmarks.clear()
                self.order.clear()
            elif kind == "undo" and self.order:
                (newest, item_id), _ = self.order.popitem()  # a dict pops its last-inserted key
                (self.strokes if newest == "stroke" else self.landmarks).pop(item_id)
            elif kind == "undo" and self.cleared:
                # An empty board after a clear: undo restores the whole cleared board, once.
                self.strokes, self.landmarks, self.order = self.cleared
                self.cleared = None
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

    # Clear is undoable once: the whole board comes back, then undo pops items again as usual.
    for ev in (s1, lib):
        relay.publish(ev)
    relay.publish({"type": "clear"})
    assert ids() == ([], [])
    relay.publish({"type": "undo"})
    assert ids() == (["s1"], ["m1"]) and drain()[-1]["type"] == "sync"
    relay.publish({"type": "undo"})
    assert ids() == (["s1"], [])
    relay.publish({"type": "clear"})
    relay.publish({"type": "clear"})  # a second clear on an empty board keeps the restorable snapshot
    relay.publish({"type": "undo"})
    assert ids() == (["s1"], [])
    drain()

    # Clear empties both, and leaves no stale order behind for the next undo.
    for ev in (lib, s1, {"type": "clear"}, s2):
        relay.publish(ev)
    assert ids() == (["s2"], [])
    relay.publish({"type": "undo"})
    assert ids() == ([], []) and not relay.order
    drain()

    # Instructions (#107): relayed as sent, only the latest kept and in sync, untouched by clear and undo.
    say1 = {"type": "instruction", "id": "i1", "text": "Find the school.", "by": "tutor"}
    say2 = {"type": "instruction", "id": "i2", "text": "Follow the line from the school to the library.", "by": "tutor"}
    relay.publish(say1)
    relay.publish(say2)
    assert drain() == [say1, say2]
    latest = {"id": "i2", "text": say2["text"], "by": "tutor"}
    assert relay.subscribe().get_nowait() == {"type": "sync", "strokes": [], "landmarks": [], "instruction": latest}
    for ev in (s1, {"type": "clear"}, {"type": "undo"}, {"type": "undo"}):
        relay.publish(ev)
    assert relay.instruction == latest and relay.sync()["instruction"] == latest
    # Heard once the phone reports saying the latest one; a line about an older one, or another kind, changes nothing.
    relay.publish({"type": "spoken", "kind": "instruction", "id": "i1", "text": say1["text"], "t": 1})
    relay.publish({"type": "spoken", "kind": "status", "id": "i2", "text": "Drawing changed.", "t": 2})
    assert "heard" not in relay.instruction
    relay.publish({"type": "spoken", "kind": "instruction", "id": "i2", "text": say2["text"], "t": 3})
    assert relay.sync()["instruction"] == {**latest, "heard": True}
    relay.publish({**say1, "id": "i3"})
    assert relay.instruction == {"id": "i3", "text": say1["text"], "by": "tutor"}, "a new instruction starts unheard"
    drain()

    # A start point (#107) is a flag on the landmark: stored only when set, cleared by re-posting without it,
    # and the landmark keeps its place in the undo order either way.
    relay.publish({"type": "clear"})
    relay.publish(lib)
    relay.publish(s2)
    relay.publish({**lib, "start": True})
    assert relay.landmarks["m1"] == {**stored(lib), "start": True} and list(relay.order) == [("landmark", "m1"), ("stroke", "s2")]
    assert relay.sync()["landmarks"] == [{**stored(lib), "start": True}]
    relay.publish({**lib, "start": False})
    assert relay.landmarks["m1"] == stored(lib)
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
