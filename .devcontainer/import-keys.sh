#!/usr/bin/bash

# Check if .devcontainer/gpg folder exists
if [ -d .devcontainer/gpg ]; then
  echo "Importing Public Keys"
  sudo gpg --import .devcontainer/gpg/public-keys.asc

  echo "Importing Private Keys"
  sudo gpg -a --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --allow-secret-key-import --import .devcontainer/gpg/private-keys.asc

  echo "Importing Trust DB"
  sudo gpg --import-ownertrust .devcontainer/gpg/owner-trust-db.txt
else
  echo "The .devcontainer/gpg folder does not exist. Skipping import."
fi
