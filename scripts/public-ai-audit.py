#!/usr/bin/env python3
"""Read-only public HTTP audit. User-agent simulation is not verified bot traffic."""
import json
import re
from urllib.parse import urlsplit
import urllib.request
import urllib.error
import urllib.robotparser
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

BASE = "https://findmydup.de"
AGENTS = ["Mozilla/5.0", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "Claude-User", "PerplexityBot", "Perplexity-User"]
PAGES = ["/", "/produkte/", "/anthbot/", "/imou/", "/samsung/", "/joybuy/", "/mactrade/", "/ueber-uns/", "/impressum/", "/partner/", "/digitale-tools/funnelcockpit/", "/ratgeber/oled-oder-qled/"]
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
        self.sections = []
        self.heading = None
        self.heading_text = []
        self.section_words = 0
        self.meta_robots = []
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
        if tag == "meta" and a.get("name", "").lower() in ("robots", "googlebot"): self.meta_robots.append(a.get("content"))
        if self.main and tag in ("h1", "h2", "h3", "h4") and not self.skip:
            if self.sections: self.sections[-1]["words_after"] = self.section_words
            self.section_words = 0
            self.heading = tag
            self.heading_text = []
    def handle_endtag(self, tag):
        if tag == "script" and self.ld:
            try: self.schemas.append(json.loads(self.buf))
            except ValueError: self.schemas.append({"invalid_json": True})
            self.ld = False
        if tag in ("script", "style", "nav"): self.skip = max(0, self.skip-1)
        if tag == self.heading:
            self.sections.append({"tag": tag, "heading": " ".join(" ".join(self.heading_text).split())})
            self.heading = None
        if tag == "main":
            if self.sections: self.sections[-1]["words_after"] = self.section_words
            self.main = False
    def handle_data(self, data):
        if self.ld: self.buf += data
        if self.main and not self.skip:
            self.text.append(data)
            if self.heading: self.heading_text.append(data)
            else: self.section_words += len(data.split())

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
    guide_paths = []
    result, xml = get(BASE+"/sitemap.xml")
    if result["status"] == 200:
        try:
            guide_paths = [urlsplit(x.text or "").path for x in ET.fromstring(xml).findall(".//{*}loc") if x.text and urlsplit(x.text).netloc == "findmydup.de" and urlsplit(x.text).path.startswith("/ratgeber/")][:20]
        except ET.ParseError: pass
    for path in dict.fromkeys(PAGES + guide_paths):
        result, html = get(BASE+path)
        p = Page()
        if result["status"] == 200: p.feed(html)
        report["pages"].append({"path": path, **result, "canonical": p.canonical, "tables": p.tables, "dates": p.dates, "schemas": p.schemas, "sections": p.sections, "meta_robots": p.meta_robots, "first_200_words": " ".join(" ".join(p.text).split()[:200])})
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
    report["llms"]["links"] = []
    if result["status"] == 200:
        for url in list(dict.fromkeys(re.findall(r"\]\((https://findmydup\.de/[^\s)]+|https://findmydup\.de/)\)", llms)))[:40]:
            status, _ = get(url)
            report["llms"]["links"].append({"url": url, "status": status["status"], "final_url": status.get("final_url")})
    try:
        request = urllib.request.Request("https://isitagentready.com/api/scan", data=json.dumps({"url": BASE}).encode(), headers={"Content-Type":"application/json"}, method="POST")
        with urllib.request.urlopen(request, timeout=90) as response:
            report["agent_readiness"] = {"status": response.status, "response": json.loads(response.read(LIMIT))}
    except (OSError, ValueError) as e:
        report["agent_readiness"] = {"error": str(e)}
    report["lighthouse_agentic_browsing"] = "Not run (Claude Code only in supplied checklist)"
    print(json.dumps(report, ensure_ascii=False, indent=2))
if __name__ == "__main__": main()
