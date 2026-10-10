import axios from "axios";
import Cookies from "js-cookie";
import { clearAuthStorage } from "./utils/auth-storage";

const PRODUCTION_API_URL = "https://holiday-hotel-free-api-d2f2hjb7ceh0hkgx.centralindia-01.azurewebsites.net";

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (window.location.hostname === "mern-booking-hotel.netlify.app" || window.location.hostname.includes("vercel.app")) return PRODUCTION_API_URL;
  if (window.location.hostname === "localhost") return "http://localhost:5001";
  return PRODUCTION_API_URL;
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("session_id");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.metadata = { retryCount: 0 };
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    const isExpected401 = error.response?.status === 401 && (config?.url === "/api/auth/validate-token" || config?.url === "/api/users/me");
    if (!isExpected401) console.error(`🚨 [API ERROR] ${config?.method?.toUpperCase() || "UNKNOWN"} ${config?.url || "UNKNOWN URL"}`, error.message);

    if (error.response?.status === 401) {
      Cookies.remove("session_id");
      localStorage.removeItem("session_id");
    }

    if (error.response?.status === 429 && config?.metadata?.retryCount < 3) {
      config.metadata.retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, config.metadata.retryCount - 1) * 1000));
      return axiosInstance(config);
    }

    if (!error.response && config?.metadata?.retryCount < 2) {
      config.metadata.retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return axiosInstance(config);
    }
    return Promise.reject(error);
  }
);



export const fetchCurrentUser = async () => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

export const register = async (formData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  return response.data;
};

export const signIn = async (formData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }
  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }
  if (response.data?.user) {
    const { email, firstName, lastName } = response.data.user;
    if (email) localStorage.setItem("user_email", email);
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    if (name) localStorage.setItem("user_name", name);
  }
  try {
    await validateToken();
  } catch {}
  return response.data;
};

export const validateToken = async () => {
  const token = localStorage.getItem("session_id");
  if (!token) return null;
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthStorage();
      throw new Error("Token invalid");
    }
    throw new Error("Token validation failed");
  }
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_image");
  return response.data;
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

export const addMyHotel = async (hotelFormData) => {
  const response = await axiosInstance.post("/api/my-hotels", hotelFormData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchMyHotels = async () => {
  const response = await axiosInstance.get("/api/my-hotels");
  return response.data;
};

export const fetchMyHotelById = async (hotelId) => {
  const response = await axiosInstance.get(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelById = async (hotelFormData) => {
  const hotelId = hotelFormData.get("hotelId");
  const response = await axiosInstance.put(`/api/my-hotels/${hotelId}`, hotelFormData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const searchHotels = async (searchParams) => {
  const queryParams = new URLSearchParams();
  if (searchParams.destination && searchParams.destination.trim() !== "") {
    queryParams.append("destination", searchParams.destination.trim());
  }
  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((f) => queryParams.append("facilities", f));
  searchParams.types?.forEach((t) => queryParams.append("types", t));
  searchParams.stars?.forEach((s) => queryParams.append("stars", s));

  const response = await axiosInstance.get(`/api/hotels/search?${queryParams}`);
  return response.data;
};

export const fetchHotels = async () => {
  const response = await axiosInstance.get("/api/hotels");
  return response.data;
};
export const fetchHotelById = async (hotelId) => {
  const response = await axiosInstance.get(`/api/hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelActive = async (hotelId, isActive) => {
  const response = await axiosInstance.patch(`/api/my-hotels/${hotelId}/active`, { isActive });
  return response.data;
};


export const createRoomBooking = async (formData) => {
  const response = await axiosInstance.post(`/api/hotels/${formData.hotelId}/bookings`, formData);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await axiosInstance.get("/api/my-bookings");
  return response.data;
};

export const fetchHotelBookings = async (hotelId) => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

export const cancelBooking = async (bookingId, payload) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`, payload || {});
  return response.data;
};



