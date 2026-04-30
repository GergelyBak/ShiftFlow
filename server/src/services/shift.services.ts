import Shift from '../models/Shift';

export const createShift = async (data: any) => {
  const shift = await Shift.create(data);
  return shift;
};

export const getUserShifts = async (userId: string) => {
  return await Shift.find({ userId });
};
