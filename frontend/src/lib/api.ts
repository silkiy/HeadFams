import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://headfams-backend.vercel.app/api",
    headers: {
        "Content-Type": "application/json",
    },
});

console.log("Current API Base URL:", process.env.NEXT_PUBLIC_API_URL);

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        // Check for admin token or secret token in localStorage
        const token = localStorage.getItem("adminToken") || localStorage.getItem("secretToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            if (typeof window !== "undefined") {
                // Optionally clear token or redirect
                // localStorage.removeItem("adminToken");
                // window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
