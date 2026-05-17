# Pi-hole Data Measurement Tools

![Screenshot from an interactive network graph of DNS queries.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/14604989-fd2d-456d-a3ec-76e8798ed294.png)

A suite of Python and frontend visualization tools for transforming exported Pi-hole DNS query logs into analyses of network activity, traffic patterns, domain behavior, client behavior and DNS metadata.

## Overview

The repo is organized as a suite of 10 independent subprojects, each focused on measuring, transforming or visualizing different aspects of DNS activity from a shared `.csv` dataset. Each tool combines a Python backend or data-processing script with its own frontend interface, allowing the same Pi-hole query data to be examined from multiple angles, such as domain activity, client behavior, reply times, query types and other DNS metrics. Overall, the project encourages practical experience with local network data, CSV processing, Python automation, web-based visualization and frontend experimentation.

## Set Up Instructions

Below are the required software programs and steps for setting up and launching applications with this repo on a Linux machine.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository: `git clone git@github.com:devbret/pihole-data-measurement-tools.git`

4. Navigate to the repo's directory: `cd pihole-data-measurement-tools`

5. Create a virtual environment: `python3 -m venv venv`

6. Activate your virtual environment: `source venv/bin/activate`

7. Install the needed dependencies: `pip install -r requirements.txt`

8. Download your Pi-hile DNS data using the instructions below

9. Choose a subdirectory for processing and viewing your DNS data

10. Exit the virtual environment: `deactivate`

### Downloading Your Pi-hole Data

These instructions have recently been improved to handle possible errors and improve readability.

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

To use any of the tools in this repo, you will need to ensure the transferred `my_dns_queries.csv` file is in the `/data` directory.

## Other Considerations

This project repo is intended to demonstrate an ability to do the following:

- Turn exported Pi-hole DNS query logs into visualizations to make network activity easier for exploring

- Analyze DNS traffic patterns over time to reveal when queries happen most often and which domains are most active

- Identify relationships between clients, domains, query types and other DNS metadata through frontend D3 graphs

If you have any questions or would like to collaborate, please reach out either on GitHub or via [my website](https://bretbernhoft.com/).

### Development Goals

Below are development goals to help map long-term progress for this project.

1. Complete a `README.md` documentation file for each subdirectory

2. Modernize or revamp the frontend `index.html` UI files for each program

3. Create a cleaner folder structure for the whole repo
