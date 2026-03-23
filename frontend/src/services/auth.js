import axios from "axios";

const BASE = "http://127.0.0.1:8000/api/auth";

// ── Store / retrieve token ──
export const getToken    = ()      => localStorage.getItem("pt_token");
export const setToken    = (token) => localStorage.setItem("pt_token", token);
export const removeToken = ()      => localStorage.removeItem("pt_token");

export const getUser = () => {
  const t = getToken();
  if (!t) return null;
  try {
    const payload  = JSON.parse(atob(t.split(".")[1]));
    const username = localStorage.getItem("pt_username") || "User";
    return { username, id: payload.user_id };
  } catch {
    return null;
  }
};

// ── Attach token to every axios request automatically ──
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── API calls ──
export const login = async (username, password) => {
  const res = await axios.post(`${BASE}/login/`, { username, password });
  setToken(res.data.access);
  localStorage.setItem("pt_username", username); // store username separately
  return res.data;
};

export const register = async (username, password, email) => {
  const res = await axios.post(`${BASE}/register/`, { username, password, email });
  return res.data;
};

export const logout = () => {
  removeToken();
  localStorage.removeItem("pt_username");
};