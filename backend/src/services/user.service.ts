import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

export const listUsers = async () => {
  return prisma.user.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { createdAt: 'desc' },
  });
};

export const updateUserAdmin = async (
  id: string,
  data: { role?: 'ADMIN' | 'CUSTOMER'; active?: boolean },
  requesterId: string,
) => {
  if (id === requesterId && data.active === false) {
    throw new Error('No podés desactivar tu propia cuenta');
  }
  if (id === requesterId && data.role && data.role !== 'ADMIN') {
    throw new Error('No podés quitarte el rol de admin a vos mismo');
  }
  const update: any = {};
  if (data.role) update.role = data.role;
  if (typeof data.active === 'boolean') update.active = data.active;
  return prisma.user.update({ where: { id }, data: update, select: PUBLIC_FIELDS });
};

export const getCurrentUser = async (id: string) => {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
};

export const updateProfile = async (
  id: string,
  data: { name?: string; email?: string },
) => {
  if (data.email) {
    const exists = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
      select: { id: true },
    });
    if (exists) throw new Error('El email ya está en uso');
  }
  const update: any = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  return prisma.user.update({ where: { id }, data: update, select: PUBLIC_FIELDS });
};

export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('Usuario no encontrado');
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error('La contraseña actual es incorrecta');
  if (newPassword.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return { ok: true };
};
