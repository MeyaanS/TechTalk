import json
import os
import subprocess
import sys
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

EMAIL= "msutarwala5711@gmail.com"
folder=os.path.dirname(os.path.abspath(__file__))
engine= os.path.join(folder, "engine")
if os.name == "nt":
    engine = engine + ".exe"

def build_engine():
    print("Building the C++ engine...") 
    try:
        subprocess.run(["g++", "-o", engine, os.path.join(folder, "engine.cpp")], check=True)
    except Exception:
         print("Could not build engine.cpp. Is g++ installed?")
         exit()

def get_json(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Haven demo (" + EMAIL + ")"})
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def get_alerts(zip_code):
    data = get_json("https://api.zippopotam.us/us/" + zip_code)
    place = data["places"][0]
    lat = round(float(place["latitude"]), 4)
    lon = round(float(place["longitude"]), 4)
    weather = get_json("https://api.weather.gov/alerts/active?point=" + str(lat) + "," + str(lon))
    alerts = []
    for item in weather.get("features", []):
        alert = item.get("properties", {})
        name = (alert.get("event") or "").lower()
        if "fire weather" in name or "red flag" in name or "evacuation" in name:
            alerts.append({
                "event": alert.get("event"),
                "expires": alert.get("expires"),
                "senderName": alert.get("senderName"),
                "description": alert.get("description"),
            })

    return place["place name"] + ", " + place["state abbreviation"], alerts


def make_answer(query):
    zip_code = query.get("zip", [""])[0]
    pets = query.get("pets", ["0"])[0]
    sim = query.get("sim", [""])[0]
    answer = {"ok": True, "place": "", "alerts": [], "simulated": False, "time": time.strftime("%H:%M")}
    force = "-1"
    if sim in ["0", "1", "2", "3"]:
        answer["simulated"] = True
        force = sim
    else:
        try:
            if len(zip_code) != 5 or not zip_code.isdigit():
                raise ValueError("ZIP code must be 5 digits")
            answer["place"], answer["alerts"] = get_alerts(zip_code)
        except Exception:
            answer["ok"] = False

    if not pets.isdigit() or len(pets) > 2:
        pets = "0"

    names = ""
    for a in answer["alerts"]:
        names = names + a["event"] + "|"
    result = subprocess.run([engine, names, pets, force], capture_output=True, text=True)
    try:
        answer.update(json.loads(result.stdout))
    except Exception:
        answer.update({"ok": False, "stage": 0, "actions": []})
    return answer


class MyHandler(BaseHTTPRequestHandler):
    def send_data(self, body, kind):
        self.send_response(200)
        self.send_header("Content-Type", kind + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, name, kind):
        with open(os.path.join(folder, name), "rb") as f:
            self.send_data(f.read(), kind)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api":
            answer = make_answer(parse_qs(url.query))
            self.send_data(json.dumps(answer).encode(), "application/json")
        elif url.path == "/" or url.path == "/index.html":
            self.send_file("index.html", "text/html")
        elif url.path == "/vfx.js":
            self.send_file("vfx.js", "application/javascript")
        else:
            self.send_error(404)


if __name__ == "__main__":
    build_engine()
    server = ThreadingHTTPServer(("", 8000), MyHandler)
    print("Haven is running at http://localhost:8000  (press Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopped.")
