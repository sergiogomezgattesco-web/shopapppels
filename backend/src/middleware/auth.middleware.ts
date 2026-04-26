import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ message: 'Acceso denegado' });
    return;
  }
  next();
};
