# Firebase Service Account Directory

[Firestore.ts](../src/lib/Firestore.ts) scans the current directory, looking for first valid configuration file to connect to Firestore database.

If the environment is set to `development` it will connect to firestore emulator.

If not, it will use the config file to connect to online Firestore Database.

It is still recommended to have the configuration file _and_ emulator if you are in `development` environment.
