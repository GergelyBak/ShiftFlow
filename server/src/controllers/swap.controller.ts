import { Request, Response } from 'express';
import { requestSwap, acceptSwap } from '../services/swap.service';

export const requestSwapController = async (req: any, res: Response) => {
  try {
    const swap = await requestSwap(req.user.id, req.body.shiftId);

    res.status(201).json(swap);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptSwapController = async (req: any, res: Response) => {
  try {
    const swap = await acceptSwap(req.params.id, req.user.id);

    res.json(swap);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
