import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (categoryId?: string, search?: string) => {
  return prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    },
    include: { category: true, stock: { select: { quantity: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, stock: true }
  });
  if (!product) throw new Error('Producto no encontrado');
  return product;
};

export const createProduct = async (data: {
  name: string; description: string; price: number;
  categoryId: string; imageUrl?: string; initialStock: number;
}) => {
  const { initialStock, ...productData } = data;
  return prisma.product.create({
    data: {
      ...productData,
      stock: {
        create: {
          quantity: initialStock,
          moves: { create: { type: 'IN', quantity: initialStock, reason: 'Stock inicial' } }
        }
      }
    },
    include: { category: true, stock: true }
  });
};

export const updateProduct = async (id: string, data: Partial<{
  name: string; description: string; price: number; categoryId: string; imageUrl: string;
}>) => {
  return prisma.product.update({ where: { id }, data, include: { category: true, stock: true } });
};

export const deleteProduct = async (id: string) => {
  await prisma.product.delete({ where: { id } });
};

export const adjustStock = async (productId: string, quantity: number, reason: string) => {
  const stock = await prisma.stock.findUnique({ where: { productId } });
  if (!stock) throw new Error('Stock no encontrado');

  const newQuantity = stock.quantity + quantity;
  if (newQuantity < 0) throw new Error('Stock insuficiente');

  return prisma.stock.update({
    where: { productId },
    data: {
      quantity: newQuantity,
      moves: {
        create: {
          type: quantity > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantity),
          reason
        }
      }
    }
  });
};

export const getCategories = async () => prisma.category.findMany();

export const createCategory = async (name: string) => {
  return prisma.category.create({ data: { name } });
};

export const deleteCategory = async (id: string) => {
  await prisma.category.delete({ where: { id } });
};
