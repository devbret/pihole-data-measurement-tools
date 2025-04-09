import csv
import json
from datetime import datetime
from collections import defaultdict

def process_dns_data(csv_file):
    time_data = defaultdict(lambda: defaultdict(int))
    
    with open(csv_file, mode='r') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            try:
                timestamp = float(row['timestamp'])
                dt = datetime.fromtimestamp(timestamp)
                
                day_of_week = dt.strftime('%A')
                time_slot = (dt.hour * 60 + dt.minute) // 10
                
                time_data[day_of_week][time_slot] += 1
            except (ValueError, KeyError) as e:
                print(f"Skipping row due to error: {e}")
    
    return time_data

def generate_json(time_data, output_file):
    heatmap_data = []
    
    for day, time_slots in time_data.items():
        for time_slot, count in time_slots.items():
            heatmap_data.append({
                "day": day,
                "time_slot": time_slot,
                "count": count
            })
    
    with open(output_file, 'w') as json_file:
        json.dump(heatmap_data, json_file, indent=4)

if __name__ == "__main__":
    csv_file_path = '../data/my_dns_queries.csv'
    
    dns_data = process_dns_data(csv_file_path)
    
    json_output_file = 'dns_heatmap_data.json'
    generate_json(dns_data, json_output_file)

    print(f"Heatmap data saved to {json_output_file}")
