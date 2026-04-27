import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (email: string, password: string, name: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('El email ya está registrado');

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true, role: true }
  });
  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');
  if (!user.active) throw new Error('Cuenta desactivada. Contactá al administrador.');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '7d' }
  );
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};
