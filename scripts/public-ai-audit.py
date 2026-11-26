#!/usr/bin/env python3
"""Read-only public HTTP audit. User-agent simulation is not verified bot traffic."""
import json
import urllib.request
import urllib.error
import urllib.robotparser
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

BASE = "https://findmydup.de"
AGENTS = ["Mozilla/5.0", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "Claude-User", "PerplexityBot", "Perplexity-User"]
PAGES = ["/", "/anthbot/", "/ratgeber/oled-oder-qled/"]
LIMIT = 2_000_000

def get(url, agent="Mozilla/5.0"):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": agent}), timeout=15) as r:
            return {"status": r.status, "final_url": r.url, "headers": dict(r.headers.items())}, r.read(LIMIT).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return {"status": e.code, "final_url": e.url}, ""
    except (OSError, ValueError) as e:
        return {"status": None, "error": str(e)}, ""

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.schemas = []
        self.tables = 0
        self.dates = []
        self.ld = False
        self.buf = ""
        self.main = False
        self.text = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and "canonical" in a.get("rel", "").split():
            self.canonical = a.get("href")
        if tag == "script":
            self.ld = a.get("type") == "application/ld+json"
            self.buf = ""
        if tag in ("script", "style", "nav"):
            self.skip += 1
        if tag == "main": self.main = True
        if tag == "table": self.tables += 1
        if tag == "time": self.dates.append(a.get("datetime"))
    def handle_endtag(self, tag):
        if tag == "script" and self.ld:
            try: self.schemas.append(json.loads(self.buf))
            except ValueError: self.schemas.append({"invalid_json": True})
            self.ld = False
        if tag in ("script", "style", "nav"): self.skip = max(0, self.skip-1)
        if tag == "main": self.main = False
    def handle_data(self, data):
        if self.ld: self.buf += data
        if self.main and not self.skip: self.text.append(data)

def main():
    report = {"note": "Simulated user agents, not verified crawler IPs; HTTP success does not prove indexing.", "crawler": [], "pages": [], "variants": []}
    robots, body = get(BASE + "/robots.txt")
    rp = urllib.robotparser.RobotFileParser()
    if robots["status"] == 200: rp.parse(body.splitlines())
    report["robots"] = {**robots, "text": body[:10000]}
    for agent in AGENTS:
        for path in ("/", "/robots.txt"):
            result, _ = get(BASE + path, agent)
            report["crawler"].append({"agent": agent, "path": path, **result, "robots_allows": rp.can_fetch(agent, BASE+path) if robots["status"]==200 else None})
    for path in PAGES:
        result, html = get(BASE+path)
        p = Page()
        if result["status"] == 200: p.feed(html)
        report["pages"].append({"path": path, **result, "canonical": p.canonical, "tables": p.tables, "dates": p.dates, "schemas": p.schemas, "first_200_words": " ".join(" ".join(p.text).split()[:200])})
    for url in (BASE+"/?utm_source=audit", BASE+"/?gclid=audit", BASE+"/anthbot", "http://findmydup.de/", "https://www.findmydup.de/"):
        result, html = get(url)
        p = Page()
        if result["status"] == 200: p.feed(html)
        report["variants"].append({"url":url, **result, "canonical":p.canonical})
    result, xml = get(BASE+"/sitemap.xml")
    report["sitemap"] = result
    if result["status"] == 200:
        try:
            root = ET.fromstring(xml)
            report["sitemap"].update({"urls":len(root.findall(".//{*}loc")), "lastmod":len(root.findall(".//{*}lastmod"))})
        except ET.ParseError: report["sitemap"]["invalid_xml"] = True
    result, llms = get(BASE+"/llms.txt")
    report["llms"] = {**result, "first_line":llms.splitlines()[0] if llms else None}
    print(json.dumps(report, ensure_ascii=False, indent=2))
if __name__ == "__main__": main()
