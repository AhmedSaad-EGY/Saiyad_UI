const APP_CONFIG = {
  apiBaseUrl:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "https://localhost:7030/api"
      : "https://sayiad.runasp.net/api",
};
