import pandas as pd
import json
from collections import Counter, defaultdict
from pathlib import Path

CSV_PATH = "../data/my_dns_queries.csv" 
OUT_DIR = Path("./out")
OUT_DIR.mkdir(exist_ok=True)

SESSION_GAP_MINUTES = 5  
MIN_SESSION_LEN = 3   
TOP_DOMAINS_PER_CLIENT = 200 
DROP_LOCALHOST = True
DROP_ARPA = True
DROP_REVERSE = True       
DROP_EMPTY_DOMAINS = True

KEEP_STATUS = None

ONLY_BLOCKED = False

def normalize_domain(d: str) -> str:
    if not isinstance(d, str):
        return ""
    d = d.strip().lower()
    if d.endswith("."):
        d = d[:-1]
    return d

def is_noise_domain(d: str) -> bool:
    if not d:
        return True
    if DROP_ARPA and d.endswith(".arpa"):
        return True
    if DROP_REVERSE and ("in-addr.arpa" in d or "ip6.arpa" in d):
        return True
    return False

def sessionize(df_client: pd.DataFrame, gap_minutes: int):
    gap = pd.Timedelta(minutes=gap_minutes)
    time_diffs = df_client["dt"].diff()
    new_session = (time_diffs.isna()) | (time_diffs > gap)
    session_ids = new_session.cumsum()
    return [g for _, g in df_client.groupby(session_ids)]

def build_transitions(domains):
    edges = Counter()
    for a, b in zip(domains, domains[1:]):
        if a == b:
            continue
        edges[(a, b)] += 1
    return edges

df = pd.read_csv(CSV_PATH)

df["dt"] = pd.to_datetime(df["timestamp"], unit="s", utc=True)

df["domain"] = df["domain"].apply(normalize_domain)

if DROP_EMPTY_DOMAINS:
    df = df[df["domain"].astype(bool)]

if KEEP_STATUS is not None:
    df = df[df["status"].isin(KEEP_STATUS)]

if ONLY_BLOCKED:
    df = df[df["status"] == 1]

if DROP_LOCALHOST:
    df = df[df["client"] != "127.0.0.1"]

df = df[~df["domain"].apply(is_noise_domain)]

df = df.sort_values(["client", "dt"]).reset_index(drop=True)

if TOP_DOMAINS_PER_CLIENT is not None:
    filtered = []
    for client, g in df.groupby("client"):
        top = g["domain"].value_counts().head(TOP_DOMAINS_PER_CLIENT).index
        filtered.append(g[g["domain"].isin(top)])
    df = pd.concat(filtered).sort_values(["client", "dt"]).reset_index(drop=True)

all_sessions = []
global_edges = Counter()
client_edges = defaultdict(Counter)

for client, g in df.groupby("client"):
    sessions = sessionize(g, SESSION_GAP_MINUTES)

    for s_idx, s in enumerate(sessions):
        domains = s["domain"].tolist()

        compressed = [domains[0]]
        for d in domains[1:]:
            if d != compressed[-1]:
                compressed.append(d)

        if len(compressed) < MIN_SESSION_LEN:
            continue

        all_sessions.append({
            "client": client,
            "session_index": s_idx,
            "start": s["dt"].iloc[0].isoformat(),
            "end": s["dt"].iloc[-1].isoformat(),
            "duration_sec": (s["dt"].iloc[-1] - s["dt"].iloc[0]).total_seconds(),
            "domains": compressed,
            "query_count": len(s)
        })

        edges = build_transitions(compressed)
        global_edges.update(edges)
        client_edges[client].update(edges)

sessions_path = OUT_DIR / "sessions.json"
with sessions_path.open("w") as f:
    json.dump(all_sessions, f, indent=2)

domain_counts = Counter(df["domain"])
domains_sorted = [d for d, _ in domain_counts.most_common()]

domain_to_id = {d: i for i, d in enumerate(domains_sorted)}

nodes = [
    {"id": domain_to_id[d], "domain": d, "count": domain_counts[d]}
    for d in domains_sorted
]

links = [
    {
        "source": domain_to_id[a],
        "target": domain_to_id[b],
        "value": w
    }
    for (a, b), w in global_edges.items()
]

transitions_path = OUT_DIR / "transitions.json"
with transitions_path.open("w") as f:
    json.dump({"nodes": nodes, "links": links}, f, indent=2)

client_transitions = {}
for client, edges in client_edges.items():
    client_transitions[client] = [
        {"source": a, "target": b, "value": w}
        for (a, b), w in edges.items()
    ]

client_transitions_path = OUT_DIR / "transitions_by_client.json"
with client_transitions_path.open("w") as f:
    json.dump(client_transitions, f, indent=2)

print("Wrote:")
print(" -", sessions_path)
print(" -", transitions_path)
print(" -", client_transitions_path)
