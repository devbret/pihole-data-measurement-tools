import pandas as pd
from datetime import datetime

df = pd.read_csv('../data/my_dns_queries.csv')

df['hour'] = df['timestamp'].apply(lambda x: datetime.fromtimestamp(x).hour)

filtered_records = df[df['status'].isin([0, 1, 2, 3])]

status_counts_by_hour = filtered_records.groupby(['hour', 'status']).size().unstack(fill_value=0).reset_index()

all_hours = pd.DataFrame({'hour': range(24)})
status_counts_by_hour = pd.merge(all_hours, status_counts_by_hour, on='hour', how='left').fillna(0)

status_counts_by_hour_json = status_counts_by_hour.to_json(orient='records')


with open('status_counts_by_hour.json', 'w') as file:
    file.write(status_counts_by_hour_json)

print("JSON file created successfully!")
