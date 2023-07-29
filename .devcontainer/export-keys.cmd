@echo off
echo Running on Windows host

set "fileContent="
for /f "usebackq delims=" %%i in (".devcontainer/gpg/gpg-key-id.txt") do set "fileContent=%%i"
echo Using Key ID %fileContent%


echo Exporting Public Keys
gpg -a --output .devcontainer/gpg/public-keys.asc --yes --export %fileContent%

echo Exporting Private Key
gpg -a --pinentry-mode loopback --passphrase-file=.devcontainer/gpg/gpg-key-password.txt --output .devcontainer/gpg/private-keys.asc --yes --export-secret-keys %fileContent%

echo Exporting Trust DB
gpg -a --export-ownertrust >.devcontainer/gpg/owner-trust-db.txt
