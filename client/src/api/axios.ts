// client/src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://shiftflow-u04y.onrender.com/api',
});
