#!/usr/bin/env python3
"""Dev server for the live preview: same as `python3 -m http.server` but sends
no-cache headers, so the browser never runs stale JS/CSS after an update."""
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    http.server.test(HandlerClass=NoCacheHandler, port=8000, bind="0.0.0.0")
