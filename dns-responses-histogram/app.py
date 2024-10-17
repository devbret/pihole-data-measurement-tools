import pandas as pd
import json

df = pd.read_csv('../data/my_dns_queries.csv')

df['reply_time_ms'] = df['reply_time'] * 1000

bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, float('inf')]
labels = [
    '0-10ms', '10-20ms', '20-30ms', '30-40ms', '40-50ms', 
    '50-60ms', '60-70ms', '70-80ms', '80-90ms', '90-100ms', '100ms+'
]

df['reply_time_bin'] = pd.cut(
    df['reply_time_ms'],
    bins=bins,
    labels=labels,
    right=False
)

bin_counts = df['reply_time_bin'].value_counts().sort_index().reset_index()
bin_counts.columns = ['bin', 'count']

data = bin_counts.to_dict(orient='records')

with open('reply_time_distribution.json', 'w') as f:
    json.dump(data, f)
