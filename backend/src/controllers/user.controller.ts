import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as userService from '../services/user.service';

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) { next(err); }
};

export const updateUserAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, active } = req.body;
    const updated = await userService.updateUserAdmin(req.params.id, { role, active }, req.userId!);
    res.json(updated);
  } catch (err) { next(err); }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getCurrentUser(req.userId!);
    res.json(user);
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    const updated = await userService.updateProfile(req.userId!, { name, email });
    res.json(updated);
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.userId!, currentPassword, newPassword);
    res.json(result);
  } catch (err) { next(err); }
};
