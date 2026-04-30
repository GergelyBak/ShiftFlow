import Swap from '../models/Swap';
import Shift from '../models/Shift';

export const requestSwap = async (userId: string, shiftId: string) => {
  const shift = await Shift.findById(shiftId);

  if (!shift) {
    throw new Error('Shift not found');
  }

  if (shift.userId.toString() !== userId) {
    throw new Error('Not your shift');
  }

  return await Swap.create({
    shiftId,
    requestedBy: userId,
  });
};

export const acceptSwap = async (swapId: string, newUserId: string) => {
  const swap = await Swap.findById(swapId);

  if (!swap) {
    throw new Error('Swap not found');
  }

  if (swap.status !== 'pending') {
    throw new Error('Already handled');
  }

  const shift = await Shift.findById(swap.shiftId);

  if (!shift) {
    throw new Error('Shift not found');
  }

  // 🔥 ownership change
  shift.userId = newUserId as any;
  await shift.save();

  swap.status = 'accepted';
  await swap.save();

  return swap;
};
