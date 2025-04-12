import pandas as pd
import json

csv_file = "../data/my_dns_queries.csv"
output_file = "hourly_metrics.json" 

df = pd.read_csv(csv_file)

df['datetime'] = pd.to_datetime(df['timestamp'], unit='s')

df['reply_time'] = df['reply_time'].fillna(0)

df['hour'] = df['datetime'].dt.floor('H')

df['error_flag'] = df['status'].apply(lambda x: 1 if x != 1 else 0)

grouped = df.groupby('hour').agg(
    avg_reply_time    = ('reply_time', 'mean'),
    min_reply_time    = ('reply_time', 'min'),
    max_reply_time    = ('reply_time', 'max'),
    median_reply_time = ('reply_time', 'median'),
    query_count       = ('id', 'count'),
    error_count       = ('error_flag', 'sum')
).reset_index()

grouped['error_rate'] = grouped['error_count'] / grouped['query_count']

grouped['hour'] = grouped['hour'].dt.strftime("%Y-%m-%dT%H:%M:%S")

hourly_metrics = grouped.to_dict(orient='records')

with open(output_file, "w") as f:
    json.dump(hourly_metrics, f, indent=2)

print(f"Hourly metrics JSON file '{output_file}' created with {len(hourly_metrics)} records.")
