# Pi-hole Data Measurement Tools

A collection of various software tools for measuring DNS queries downloaded from a Pi-hole as a CSV file.

## Downloading Your Pi-hole Data

These instructions were originally sourced from ChatGPT. But have since been improved to handle possible challenges/errors and improve readability.

1 - **Access Pi-hole Admin Interface:**

First, ensure you can access the Pi-hole admin interface. This is usually accessed via `http://<your-pi's-ip-address>/admin` from a browser within the same local area network.

2 - **Use The Web Interface:**

Go to the "Query Log" section. Here, you can see recent queries, but for a complete download, you'll need to access the underlying data directly from the database.

3 - **Access The Pi-hole Terminal:**

SSH into your Raspberry Pi by using a command like `ssh username@<your-pi's-ip-address>` from a terminal on your computer. Make sure to replace <your-pi's-ip-address> with the actual IP address of your Raspberry Pi.

4 - **Export DNS Queries:**

You then can interact with the database and export your DNS queries, for example, by running this command:

> sqlite3 /etc/pihole/pihole-FTL.db -header -csv "SELECT \* FROM queries;" > /home/usernamei/my_dns_queries.csv

This command sets up the output with headers, changes the mode to CSV for easy data handling, outputs the result to a file named "my_dns_queries.csv" and selects all records from the queries table.

5 - **Retrieve The Exported File:**

After exporting you can use scp (secure copy) to transfer this file to your local machine. For example, you could run this command in your computer's terminal:

> scp username@<your-pi's-ip-address>:/path/to/my_dns_queries.csv /local/destination.

If you are having trouble transferring your DNS queries CSV file, it might be helpful to run the following command on the Raspberry Pi to ensure you have the correct permissions:

> chmod 644 /home/username/my_dns_queries.csv

6 - **Analyze The Data:**

To use any of the tools in this repo, you will need to ensure the transferred "my_dns_queries.csv" file is in the `/data` directory.
