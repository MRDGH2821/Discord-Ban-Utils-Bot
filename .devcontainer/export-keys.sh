#!/usr/bin/bash
# Linux and macOS-specific commands for initialization

# Check if the script is running on GitHub Codespaces
if [[ -n "${CODESPACES}" ]]; then
  printf "Running in GitHub Codespaces.\nNo need to export any keys."
  # Add your specific commands for GitHub Codespaces here, if needed
else
  echo "Running on Linux or macOS host"
  # Add your GPG export and import commands here for Linux and macOS

  fileContent=$(cat .devcontainer/gpg/gpg-key-id.txt)

  echo "Exporting Public Keys"
  gpg -a --output .devcontainer/gpg/public-keys.asc --yes --export "$fileContent"

  echo "Exporting Private Key"
  gpg -a --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --output .devcontainer/gpg/private-keys.asc --yes --export-secret-keys "$fileContent"

  echo "Exporting Trust DB"
  gpg -a --export-ownertrust >.devcontainer/gpg/owner-trust-db.txt

fi
