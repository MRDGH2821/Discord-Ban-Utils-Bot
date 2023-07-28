@echo off
echo "Running on Windows host"

set "fileContent="
for /f "usebackq delims=" %%i in (".devcontainer/gpg/gpg-key-id.txt") do set "fileContent=%%i"
echo Using Key ID %fileContent%


echo Exporting Public Keys
gpg -a --export --output .devcontainer/gpg/public-keys.asc --yes

echo Exporting Private Key
gpg -a --pinentry-mode loopback --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --export-secret-keys %fileContent% > .devcontainer/gpg/private-keys.asc 

echo Exporting Trust DB
gpg -a --export-ownertrust --output .devcontainer/gpg/owner-trust-db.txt > .devcontainer/gpg/owner-trust-db.txt
