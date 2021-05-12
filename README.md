# Overview
This extension censors images on NSFW reddit subs.

It requires running local [NudeNet](https://github.com/notAI-tech/NudeNet) servers using Docker, which is described in the instructions below.

# 🚨 THIS IS AN ALPHA EXTENSION 🚨
- it is not officially released
- it is not available in the store and can only be run in developer mode
- it has bugs
- it doesn't work in all cases
- it lacks features
- it necessarily makes assumptions about upstream websites that are out of its control
- it depends on other software
- there is no warranty or support (feel free to use GitHub issues)
- the setup process may be beyond your comfort level or expertise

# Using the extension
1. Set up and run local NudeNet servers:
    - Download & install [Docker Desktop](https://www.docker.com/products/docker-desktop)
    - Start Docker
    - Download the [extension source](https://github.com/ousideti/reddit-nsfw-censor-extension/archive/refs/heads/master.zip) from GitHub
    - Note the location of this download, referred to as `{YOUR_EXTENSION_SOURCE_LOCATION}`
    - Open a terminal:
        - `cd {YOUR_EXTENSION_SOURCE_LOCATION}`
        - `docker-compose up -d`
            - (This will build and run the Nudenet classifier and detector servers needed to power the extension)
            - (You can check the status of the servers by running `docker ps` and observing whether they are running)
            - (You can stop the servers by running `docker-compose stop`, or simply quitting the Docker program)
    - NOTE: you will have to repeat this step any time the servers stop; e.g., when you restart your computer

2. Set up and run the extension
    - Download the [extension release]() from Github and unzip
    - Note the location of this download, referred to as `{YOUR_EXTENSION_RELEASE_LOCATION}`
    - open Chrome or another Chromium browser (e.g. Brave)
    - navigate to `chrome://extensions`
    - enable Developer Mode
    - click `Load unpacked`, and select the `{YOUR_EXTENSION_RELEASE_LOCATION}` folder

3. Try it out
    - Navigate to a NSFW sub on Reddit and see that the images are censored
    - Modify the extension settings (there aren't many for now) by clicking the extension icon in your browser

# Updating the extension (getting a new version)    
  - open your browser
  - navigate to `chrome://extensions`
  - Locate the old extension and remove it
  - repeat step `2` in the instructions above

# Doing development
  - set up the dependencies from step 1
  - open `{YOUR_EXTENSION_SOURCE_LOCATION}` in your editor
  - in that folder, run:
    - `yarn` or `npm i` to install dependencies
    - `yarn watch` or `npm run watch` to build the project in watch mode
    - in chrome, navigate to `chrome://extensions`
    - install the extension from `{YOUR_EXTENSION_SOURCE_LOCATION}`