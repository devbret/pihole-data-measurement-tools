# Blocked Domains

This app processes and visualizes the most commonly blocked domains from your Pi-hole data, as a word cloud.

## Set Up

### Steps

1 - Open a terminal and navigate to this directory.

2 - Run `python3 app.py` in your terminal.

3 - To view the word cloud, you will need to run a local web server. To do this, run `python3 -m http.server` in the same terminal from the previous steps.

4 - Open [this link](http://localhost:8000/) in a browser of your choice. You should be able to see your word cloud of commonly blocked TLDs.
