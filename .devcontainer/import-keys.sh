#!/usr/bin/bash

# Check if .devcontainer/gpg folder exists
if [ -d .devcontainer/gpg ]; then
  #echo "Importing Public Keys"
  #sudo gpg --import .devcontainer/gpg/public-keys.asc

  echo "\nImporting Private Keys"
  sudo gpg -a --passphrase-file=.devcontainer/gpg/gpg-password.txt --import .devcontainer/gpg/private-keys.asc

  echo "\nImporting Trust DB"
  sudo gpg --import-ownertrust .devcontainer/gpg/owner-trust-db.txt
else
  echo "The .devcontainer/gpg folder does not exist. Skipping import."
fi
