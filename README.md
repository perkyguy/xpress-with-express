# Xpress with Express (and NodeJS)

This is a project which goes along with an [MPLab Xpress Example](http://link)

It uses NodeJS to set up web server, and creates a socket connectoin to an MPLab Xpress Evaluation Board with an attached Mikro Elektronika WiFly Click Board. 
From the web page, you are then able to set a "relay" (this is just an LED for now) perform ADC reads for the on-board potentiometer.   

# Usage
1. Need to install the dependancies with `npm install`
2. Power on your Xpress board and WiFly Click and wait for it to connect to your SSID (~30s?)
3. Run the NodeJS Server with `npm run start`
4. Visit http://localhost/1337
