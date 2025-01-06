import axios from "axios";

const url = import.meta.env.VITE_BACKEND_API_URL;

const instance = axios.create({
  baseURL: url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// CSRF トークンを取得して設定
instance
  .get(`${import.meta.env.VITE_BACKEND_URL}/sanctum/csrf-cookie`)
  .then((response) => {
    instance.defaults.headers.common["X-CSRF-TOKEN"] = response.data.csrf_token;
  })
  .catch((error) => {
    console.error("Failed to fetch CSRF token:", error);
  });

export default instance;
