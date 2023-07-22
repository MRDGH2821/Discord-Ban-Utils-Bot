#!/usr/bin/env bash

echo "Installing Firefox ESR"
sudo apt-get update
export DEBIAN_FRONTEND=noninteractive
sudo apt-get install -y firefox-esr
