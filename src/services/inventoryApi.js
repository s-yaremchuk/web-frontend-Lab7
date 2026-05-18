import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

const extractData = (response) => response.data;
const normalizeInventoryItem = (item) => {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    id: item.id ?? item._id,
    photo_url: item.photo_url ?? item.photoUrl
  };
};

export const getInventory = async () => {
  const data = await api.get("/inventory").then(extractData);
  const list = Array.isArray(data) ? data : data?.items ?? [];
  return list.map(normalizeInventoryItem);
};

export const createInventory = async (formData) =>
  api
    .post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(extractData)
    .then(normalizeInventoryItem);

export const getInventoryById = async (id) =>
  api.get(`/inventory/${id}`).then(extractData).then(normalizeInventoryItem);

export const updateInventoryText = async (id, payload) =>
  api.put(`/inventory/${id}`, payload).then(extractData).then(normalizeInventoryItem);

export const updateInventoryPhoto = async (id, formData) =>
  api
    .put(`/inventory/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(extractData)
    .then(normalizeInventoryItem);

export const deleteInventory = async (id) =>
  api.delete(`/inventory/${id}`).then(extractData);

export const getInventoryPhotoUrl = (id) => {
  if (!id) return "";
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  return `${cleanBase}/inventory/${id}/photo`;
};
