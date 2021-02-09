#!/bin/bash
cd /home/ec2-user/server
sudo npm i pm2 -g
sudo rm -rf node_modules/
npm i
