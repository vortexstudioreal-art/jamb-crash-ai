import os, json, urllib.request, urllib.parse
from collections import defaultdict

url = os.environ.get("VITE_SUPABASE_URL", "https://pjdgzqnyyobtiwplatni.supabase.co")
key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZGd6cW55eW9idGl3cGxhdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjk0NzMsImV4cCI6MjEwMDYwNTQ3M30.kL3ZsJb4fCoYvuTXGzXL0um3Ui1vvZEVslPVXiToyPs")

rows = []
offset = 0
while True:
    q = urllib.parse.urlencode({
        "select": "subject,is_ai_generated,explanation",
        "limit": "1000",
        "offset": str(offset),
    })
    req = urllib.request.Request(f"{url}/rest/v1/jamb_questions?{q}", headers={
        "apikey": key, "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=60) as r:
        batch = json.load(r)
    rows.extend(batch)
    if len(batch) < 1000:
        break
    offset += 1000

stats = defaultdict(lambda: {"total":0, "real":0, "ai":0, "no_expl":0})
for r in rows:
    s = stats[r["subject"]]
    s["total"] += 1
    if r["is_ai_generated"]:
        s["ai"] += 1
    else:
        s["real"] += 1
    if not (r.get("explanation") or "").strip():
        s["no_expl"] += 1

print(f"{'subject':<28}{'total':>7}{'real':>7}{'ai':>6}{'no_expl':>9}")
print("-" * 57)
for name in sorted(stats, key=lambda k: stats[k]["total"]):
    s = stats[name]
    print(f"{name:<28}{s['total']:>7}{s['real']:>7}{s['ai']:>6}{s['no_expl']:>9}")
print("-" * 57)
print(f"{'TOTAL':<28}{len(rows):>7}")
