export default ({ config }) => {
  const isDev = process.env.APP_ENV === "development";

  return {
    ...config,
    extra: {
      apiUrl: isDev
        ? "http://127.0.0.1:3000/getuser/employees"
        : "aws link goes here later"
    }
  };
};