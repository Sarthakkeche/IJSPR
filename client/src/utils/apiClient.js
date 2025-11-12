import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.ijrws.com/index.php/ijrws/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_OJS_API_KEY}`,
  },
});

export default apiClient;
