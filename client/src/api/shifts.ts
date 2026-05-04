import { api } from './axios';

export const createShift = async (data: {
  date: string;
  startTime: string;
  endTime: string;
}) => {
  const token = localStorage.getItem('token');

  const res = await api.post('/shifts', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
export const deleteShift = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await api.delete(`/shifts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
