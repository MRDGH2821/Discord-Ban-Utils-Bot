# Configuring Commit Signing

If you plan to use a devcontainer with this [config](../devcontainer.json), then you need to have commit signing configured.
Otherwise devcontainer build may fail.

Read more & configure commit signing - <https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification>

Add GPG keys to GitHub - <https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account>

If you are using GitHub Codespaes - <https://docs.github.com/en/codespaces/managing-your-codespaces/managing-gpg-verification-for-github-codespaces>

## Instructions

This is not required in Codespaces.

1. Configure Commit signing in your host OS.
2. Create a file `gpg-password.txt` where you should put your gpg passphrase in plain text.
3. Reopen this repo in devcontainer.
