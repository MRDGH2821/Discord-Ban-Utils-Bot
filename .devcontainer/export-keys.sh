#!/usr/bin/bash
# Linux and macOS-specific commands for initialization

# Check if the script is running on GitHub Codespaces
if [[ ! -z "${CODESPACES}" ]]; then
  echo "Running in GitHub Codespaces.\nNo need to export any keys."
  # Add your specific commands for GitHub Codespaces here, if needed
else
  echo "Running on Linux or macOS host"
  # Add your GPG export and import commands here for Linux and macOS

  bash .devcontainer/export-keys.cmd
fi
