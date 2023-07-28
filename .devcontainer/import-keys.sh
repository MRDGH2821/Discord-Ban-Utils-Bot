#!/usr/bin/bash

# Check if the script is running on GitHub Codespaces
if [[ -n "${CODESPACES}" ]]; then
  printf "Running in GitHub Codespaces.\nNo need to import any keys."
else
  # Check if .devcontainer/gpg folder has required files
  if [ -f ".devcontainer/gpg/public-keys.asc" ]; then
    echo "Importing Public Keys"
    sudo gpg --import .devcontainer/gpg/public-keys.asc
  else
    echo "public-keys.asc file not found"
  fi

  if [ -f ".devcontainer/gpg/private-keys.asc" ]; then
    echo "Importing Private Keys"
    sudo gpg -a --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --allow-secret-key-import --import .devcontainer/gpg/private-keys.asc
  else
    echo "private-keys.asc file not found"
  fi

  if [ -f ".devcontainer/gpg/owner-trust-db.txt" ]; then
    echo "Importing Trust DB"
    sudo gpg --import-ownertrust .devcontainer/gpg/owner-trust-db.txt
  else
    echo "owner-trust-db.txt file not found"
  fi

fi
