// client/src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://shiftflow-4l1b.onrender.com/api',
});
