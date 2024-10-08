# Pi-hole Data Measurement Tools

Different software tools for measuring DNS queries downloaded from a Pi-hole as a CSV file.

## Downloading Your Pi-hole Data

I am following these instructions from GPT-4:

1 - **Access Pi-hole Admin Interface:**

First, ensure you can access the Pi-hole admin interface. This is usually accessed via http://<your-pi's-ip-address>/admin from a browser within the same network.

2 - **Use the Web Interface:**

Go to the "Query Log" section. Here, you can see recent queries, but for a complete download, you'll need to access the underlying data directly from the database.

3 - **Access the Pi-hole Terminal:**

SSH into your Raspberry Pi by using a command like ssh pi@<your-pi's-ip-address> from a terminal on your computer (replace <your-pi's-ip-address> with the actual IP address of your Raspberry Pi).

4 - **Navigate to the Pi-hole Database:**

Pi-hole stores its data in a SQLite database usually located at /etc/pihole/pihole-FTL.db.

5 - **Export DNS Queries:**

You can use the sqlite3 command to interact with the database and export the DNS queries. First, access the database with sqlite3 /etc/pihole/pihole-FTL.db.

Once inside the SQLite prompt, you can run a query to export the data. For example:

> .headers on

> .mode csv

> .output my_dns_queries.csv

> SELECT \* FROM queries;

> .quit

This command sequence sets up the output with headers, changes the mode to CSV for easy data handling, outputs the result to a file named my_dns_queries.csv, selects all records from the queries table, and then exits SQLite.

6 - **Retrieve the Exported File:**

After exporting, you'll find my_dns_queries.csv in the directory where you ran the SQLite command. You can use scp (secure copy) to transfer this file to your local machine, e.g., scp pi@<your-pi's-ip-address>:/path/to/my_dns_queries.csv /local/destination.

7 - **Analyze the Data:**

You can now open my_dns_queries.csv with any program that supports CSV files (like Microsoft Excel, Google Sheets, or a text editor) to analyze your DNS query records.
