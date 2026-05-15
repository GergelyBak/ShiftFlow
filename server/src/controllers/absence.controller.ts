import { Request, Response } from 'express';
import Absence from '../models/Absence';

// POST /api/absences — employee kér szabadságot
export const createAbsence = async (req: any, res: Response) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const absence = await Absence.create({
      userId: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    res.status(201).json(absence);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/absences/my — saját kérelmek
export const getMyAbsences = async (req: any, res: Response) => {
  try {
    const absences = await Absence.find({ userId: req.user.id })
      .sort({ startDate: -1 });
    res.json(absences);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/absences/all — összes kérelem (admin)
export const getAllAbsences = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const absences = await Absence.find()
      .populate('userId', 'firstName lastName email')
      .sort({ startDate: -1 });
    res.json(absences);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/absences/:id/approve — admin jóváhagyja
export const approveAbsence = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const absence = await Absence.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true },
    ).populate('userId', 'firstName lastName email');

    if (!absence) return res.status(404).json({ message: 'Not found' });
    res.json(absence);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/absences/:id/reject — admin elutasítja
export const rejectAbsence = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const absence = await Absence.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true },
    ).populate('userId', 'firstName lastName email');

    if (!absence) return res.status(404).json({ message: 'Not found' });
    res.json(absence);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/absences/:id — employee törli saját pending kérelmét
export const deleteAbsence = async (req: any, res: Response) => {
  try {
    const absence = await Absence.findById(req.params.id);
    if (!absence) return res.status(404).json({ message: 'Not found' });

    if (absence.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (absence.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Can only delete pending requests' });
    }

    await Absence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};