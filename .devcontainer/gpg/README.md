# Devcontainer commit signing

If you plan to use a devcontainer with this [config](../devcontainer.json), then you need to have commit signing configured.
Otherwise devcontainer build may fail.

Setup commit signing by following the steps here - <https://github.com/microsoft/vscode/wiki/Commit-Signing#install-tools>

## Instructions

This is not required in Codespaces.

1. Configure Commit signing in your host OS.
2. Create a file `gpg-key-id.txt` where you should put your gpg key id in plain text.
   Run this command:

   ```sh
   gpg --list-secret-keys --keyid-format LONG
   ```

   Which will give output similar to this:

   ```output
   ---------
   sec   ed25519/D4EE7AD8E6DED2F6 2023-07-21 [SC]
         480C0344C6851E72C53C25B4D4EE7AD8E6DED2F6
   uid                 [ultimate] MRDGH2821 <ask.mrdgh2821@outlook.com>
   ssb   cv25519/02D167CBD4D0A916 2023-07-21 [E]
   ```

   So in `gpg-key-id.txt` you have to put `D4EE7AD8E6DED2F6`

3. Create a file `gpg-key-password.txt` where you should put your gpg passphrase in plain text.
4. Reopen this repo in devcontainer.
