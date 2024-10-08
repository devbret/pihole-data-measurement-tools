import pandas as pd
from datetime import datetime
import json

df = pd.read_csv('')

df['date'] = df['timestamp'].apply(lambda x: datetime.fromtimestamp(x).strftime('%Y-%m-%d'))

query_counts = df.groupby(['date', 'client']).size().unstack(fill_value=0)

result = {}
for client in query_counts.columns:
    result[client] = [{'date': date, 'count': int(query_counts.loc[date, client])} for date in query_counts.index]

json_file = 'client_dns_query_counts.json'
with open(json_file, 'w') as f:
    json.dump(result, f, indent=4)

print(f"JSON file '{json_file}' has been created successfully!")
