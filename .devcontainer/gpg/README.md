# Devcontainer commit signing

If you plan to use a devcontainer with this [config](../devcontainer.json), then you need to have commit signing configured.
Otherwise devcontainer build may fail.

Setup commit signing by following the steps here - <https://github.com/microsoft/vscode/wiki/Commit-Signing#install-tools>

## Instructions

This is not required in Codespaces.

1. Configure Commit signing in your host OS.
2. Create a file `gpg-password.txt` where you should put your gpg passphrase in plain text.
3. Reopen this repo in devcontainer.
