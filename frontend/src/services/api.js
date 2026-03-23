import axios from "axios";

const BASE = "http://127.0.0.1:8000/api/expenses/";

export const getExpenses   = ()         => axios.get(BASE);
export const createExpense = (data)     => axios.post(BASE, data);
export const updateExpense = (id, data) => axios.put(`${BASE}${id}/`, data);
export const deleteExpense = (id)       => axios.delete(`${BASE}${id}/`);