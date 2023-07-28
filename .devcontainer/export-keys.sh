#!/usr/bin/bash
# Linux and macOS-specific commands for initialization

# Check if the script is running on GitHub Codespaces
if [[ ! -z "${CODESPACES}" ]]; then
  echo "Running in GitHub Codespaces.\nNo need to export any keys."
  # Add your specific commands for GitHub Codespaces here, if needed
else
  echo "Running on Linux or macOS host"
  # Add your GPG export and import commands here for Linux and macOS

  fileContent=$(cat .devcontainer/gpg/gpg-key-id.txt)

  echo "Exporting Public Keys"
  gpg -a --export --output .devcontainer/gpg/public-keys.asc --yes

  echo "Exporting Private Key"
  gpg -a --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --export-secret-keys $fileContent --output .devcontainer/gpg/private-keys.asc --yes

  echo "Exporting Trust DB"
  gpg -a --export-ownertrust --output .devcontainer/gpg/owner-trust-db.txt >.devcontainer/gpg/owner-trust-db.txt

fi
