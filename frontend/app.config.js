export default ({ config }) => {
  const isDev = process.env.APP_ENV === "development";

  return {
    ...config,
    extra: {
      apiUrl: isDev
        ? "http://192.168.0.199:3000"
        : "https://1vyn8sez3k.execute-api.us-east-2.amazonaws.com/Prod"
    }
  };
};