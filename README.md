# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Go to frontend folder

   ```bash
   cd frontend
   ```

3. Start the app

   ```bash
   npx expo start
   ```

4. Alternatively, run
```
make frontend
```

from the root of the project (the `charted` folder), which runs `npx expo start --tunnel`, with an extra variable in front needed for local development (it tells the app to use the local url instead of the AWS one in the cloud)

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
  - NOTE: if Expo Go not loading app, try starting the app with:

  ```bash
  npx expo start --tunnel
  ```

  instead of npx expo start

## Supabase Connection for Contributors
- A .env file must be added to the frontend folder for Supabase
- Refer to (https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) for connection details

## To Run Backend

To run the backend, use the Makefile to run:

```
make backend
```

from the root of the project (the `charted` folder)

This command runs `sam build` and `sam local start-api` back to back. If it hangs after the build command, you may have to restart your computer.

**Important note:** you will need to add an `env.json` file to the `frontend` folder. The contents will be sent in the Discord, and contains the URL and key for the supabase database.
