echo "Exporting Public Keys"
gpg -a --export --output .devcontainer/gpg/public-keys.asc --yes

echo "Exporting Private Keys"
gpg -a --pinentry-mode loopback --passphrase-file=.devcontainer/gpg/gpg-password.txt --export-secret-keys --output .devcontainer/gpg/private-keys.asc --yes

echo "Exporting Trust DB"
gpg -a --export-ownertrust --output .devcontainer/gpg/owner-trust-db.txt > .devcontainer/gpg/owner-trust-db.txt
