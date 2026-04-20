# Charted

## About the Project
Charted is a curated social map platform that allows users to pin, share, and explore meaningful locations recommended only by themselves and their friends. Unlike influencer-driven maps or generic review platforms, this app prioritizes authentic, small-scale discoveries: from local hidden gems to personal hangouts within a closed, trusted network. Charted creates a private, trusted ecosystem of location sharing, free from algorithms and external influence. With this, we stress the authenticity of users to grow a community and be unique.

## Features
- Location Pinning
- 

## Frameworks & Tools
- **Frontend**
  - React Native
  - Expo Go
  - 
- **Backend**
  - Supabase: Database and Authentication
  - AWS - Photo Cloud Storage

## Running
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

To run the backend locally, use the Makefile to run:

```
make backend
```

from the root of the project (the `charted` folder)

This command runs `sam build` and `sam local start-api` back to back. If it hangs after the build command, you may have to restart your computer.

## To Deploy the Backend

To deploy the backend to the AWS servers, use the makefile to run:

```
make deploy
```

from the root of the project (the `charted` folder)

This command runs `sam build` and `sam deploy` back to back. If it hangs after the build command, you may have to restart your computer.

**Important note:** you will need to add an `env.json` file to the root of the `charted-backend` folder. The contents will be sent in the Discord, and contains the URL and key for the supabase database.
