import csv
import json

def build_tree_structure(domain, subdomains):
    root = {"name": "root", "children": []}
    subdomains.add(domain)
    
    for subdomain in subdomains:
        parts = subdomain.split('.')
        current_node = root
        
        for part in reversed(parts):
            found = None
            for child in current_node["children"]:
                if child["name"] == part:
                    found = child
                    break
            
            if found is None:
                new_node = {"name": part, "children": []}
                current_node["children"].append(new_node)
                current_node = new_node
            else:
                current_node = found

    return root["children"][0]

def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def process_csv(csv_file, selected_domain):
    subdomains = set()

    with open(csv_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            domain = row['domain']
            if domain == selected_domain or domain.endswith('.' + selected_domain):
                subdomains.add(domain)

    if subdomains:
        tree_structure = build_tree_structure(selected_domain, subdomains)
        filename = "domain_tree.json"
        save_to_json(tree_structure, filename)
        print(f"JSON file '{filename}' has been created.")
    else:
        print(f"No records found for domain {selected_domain} in the CSV file.")

csv_file = "../data/my_dns_queries.csv"

selected_domain = input("Please enter the domain you want to create a tree for: ")

process_csv(csv_file, selected_domain)
