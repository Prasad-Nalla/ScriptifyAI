const BASE_URL = "http://localhost:5000/api";

/* ── Auth ── */
export const registerUser = async (fullName, email, password) => {
  const res  = await fetch(`${BASE_URL}/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ fullName, email, password }),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res  = await fetch(`${BASE_URL}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getProfile = async (token) => {
  const res  = await fetch(`${BASE_URL}/auth/profile`, {
    method:  "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/* ── Documents ── */
export const saveDocument = async (token, docData) => {
  const res  = await fetch(`${BASE_URL}/document`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${token}`,
    },
    body: JSON.stringify(docData),
  });
  return res.json();
};

export const getDocuments = async (token) => {
  const res  = await fetch(`${BASE_URL}/document`, {
    method:  "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const deleteDocument = async (token, id) => {
  const res  = await fetch(`${BASE_URL}/document/${id}`, {
    method:  "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};