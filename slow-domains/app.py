import csv
from collections import defaultdict
import json

def extract_tld(domain):
    parts = domain.split('.')
    if len(parts) > 1:
        return '.'.join(parts[-2:])  
    return None

def calculate_average_reply_times(csv_file):
    tld_times = defaultdict(list)

    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            tld = extract_tld(row['domain'])
            if tld:
                try:
                    reply_time = float(row['reply_time'])
                    tld_times[tld].append(reply_time)
                except ValueError:
                    continue  

    average_times = {}
    for tld, times in tld_times.items():
        average_times[tld] = sum(times) / len(times)

    return average_times

def write_tlds_to_json(average_times, json_file):
    sorted_tlds = sorted(average_times.items(), key=lambda x: x[1], reverse=True)
    with open(json_file, mode='w') as file:
        json.dump(dict(sorted_tlds), file, indent=4)

def process_csv_to_json(csv_file, json_file):
    average_times = calculate_average_reply_times(csv_file)
    write_tlds_to_json(average_times, json_file)

csv_file = ''
json_file = 'tlds_average_reply_times.json'

process_csv_to_json(csv_file, json_file)
