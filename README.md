# Pi-hole Data Measurement Tools

![Screenshot from an interactive network graph of DNS queries.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/14604989-fd2d-456d-a3ec-76e8798ed294.png)

A collection of various data analysis software programs for exploring DNS queries downloaded from Pi-hole as a CSV file.

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

> sudo sqlite3 /etc/pihole/pihole-FTL.db -header -csv "SELECT \* FROM queries;" > /home/username/my_dns_queries.csv

This command sets up the output with headers, changes the mode to CSV for easy data handling, outputs the result to a file named "my_dns_queries.csv" and selects all records from the queries table.

5 - **Retrieve The Exported File:**

After exporting you can use scp (secure copy) to transfer this file to your local machine. For example, you could run this command in a new terminal:

> scp username@<your-pi's-ip-address>:/path/to/my_dns_queries.csv /local/destination

If you are having trouble transferring your DNS queries CSV file, it might be helpful to run the following command on the Raspberry Pi to ensure you have the correct permissions:

> chmod 644 /home/username/my_dns_queries.csv

6 - **Analyze The Data:**

To use any of the tools in this repo, you will need to ensure the transferred "my_dns_queries.csv" file is in the `/data` directory.

## Set Up Instructions

Below are the required software programs and steps for setting up and launching applications with this repo.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository using `git` by running the following command: `git clone git@github.com:devbret/pihole-data-measurement-tools.git`

4. Navigate to the repo's directory by running: `cd pihole-data-measurement-tools`

5. Install the needed dependencies for running the script: `pip install -r requirements.txt`

6. Assuming you have downloaded Pi-hole DNS queries, the next step is to process your data using the `app.py` Python script located inside each subdirectory

7. Next, launch the frontend UI for a given tool in order to explore your data

## Other Considerations

This repo is currently a work in progress and should be treated as such. As there are many critical improvements to make to most of the data analysis tools.

### Development Goals

Below are development goals to help map long-term progress for this project.

1. Complete a `README.md` documentation file for each subdirectory

2. Modernize or revamp the frontend `index.html` UI files for each program

3. Create a cleaner folder structure for the whole repo
