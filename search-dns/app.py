import csv
from collections import defaultdict
import os

def extract_tld_and_subdomain(domain):
    parts = domain.split('.')
    tld = parts[-1]
    subdomain = '.'.join(parts[:-1])
    return tld, subdomain

def main():
    csv_file = "../data/my_dns_queries.csv"
    keyword = input("Enter the keyword to search: ").lower()
    output_file = "filtered_dns_results.txt"

    if not os.path.exists(csv_file):
        print(f"The file '{csv_file}' does not exist.")
        return

    unique_domains = defaultdict(list)

    try:
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                row_str = ','.join(row.values()).lower()
                if keyword in row_str:
                    domain = row['domain']
                    unique_domains[domain].append(row)

    except Exception as e:
        print(f"Error reading the file: {e}")
        return

    sorted_domains = sorted(
        unique_domains.items(),
        key=lambda x: extract_tld_and_subdomain(x[0])
    )

    try:
        with open(output_file, mode='w') as file:
            for domain, rows in sorted_domains:
                first_row = rows[0]
                file.write(','.join(first_row.values()) + '\n')

        print(f"Results saved to '{output_file}'.")

    except Exception as e:
        print(f"Error writing to the file: {e}")

if __name__ == "__main__":
    main()
