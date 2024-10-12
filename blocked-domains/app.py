import csv
from collections import defaultdict
import json

def extract_tld(domain):
    parts = domain.split('.')
    if len(parts) > 1:
        return '.'.join(parts[-2:])
    return None

def calculate_tld_blocks(csv_file):
    tld_blocks = defaultdict(int)

    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['status'] == '2': 
                tld = extract_tld(row['domain'])
                if tld:
                    tld_blocks[tld] += 1  

    return tld_blocks

def write_tlds_to_json(tld_blocks, json_file):
    sorted_tlds = sorted(tld_blocks.items(), key=lambda x: x[1], reverse=True)
    with open(json_file, mode='w') as file:
        json.dump(dict(sorted_tlds), file, indent=4)

def process_csv_to_json(csv_file, json_file):
    tld_blocks = calculate_tld_blocks(csv_file)
    write_tlds_to_json(tld_blocks, json_file)


csv_file = '../data/my_dns_queries.csv' 
json_file = 'tlds_blocked_counts.json'

process_csv_to_json(csv_file, json_file)
