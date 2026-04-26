import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: { email: 'admin@shop.com', password: adminPassword, name: 'Admin', role: 'ADMIN' }
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@shop.com' },
    update: {},
    create: { email: 'customer@shop.com', password: customerPassword, name: 'Cliente Demo', role: 'CUSTOMER' }
  });

  const electronics = await prisma.category.upsert({
    where: { name: 'Electrónica' },
    update: {},
    create: { name: 'Electrónica' }
  });
  const clothing = await prisma.category.upsert({
    where: { name: 'Ropa' },
    update: {},
    create: { name: 'Ropa' }
  });
  const food = await prisma.category.upsert({
    where: { name: 'Alimentos' },
    update: {},
    create: { name: 'Alimentos' }
  });

  const products = [
    { name: 'Laptop Pro 15"', description: 'Laptop de alto rendimiento con 16GB RAM', price: 1299.99, categoryId: electronics.id, stock: 10 },
    { name: 'Auriculares Bluetooth', description: 'Auriculares inalámbricos con cancelación de ruido', price: 89.99, categoryId: electronics.id, stock: 25 },
    { name: 'Smartphone X12', description: 'Teléfono inteligente con cámara de 108MP', price: 599.99, categoryId: electronics.id, stock: 15 },
    { name: 'Remera Básica', description: 'Remera de algodón 100%', price: 19.99, categoryId: clothing.id, stock: 50 },
    { name: 'Jeans Slim', description: 'Jeans de corte slim fit', price: 49.99, categoryId: clothing.id, stock: 30 },
    { name: 'Café Premium 500g', description: 'Café de origen único, tostado medio', price: 12.99, categoryId: food.id, stock: 100 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: { name: p.name, description: p.description, price: p.price, categoryId: p.categoryId }
    });
    await prisma.stock.create({
      data: {
        productId: product.id,
        quantity: p.stock,
        moves: { create: { type: 'IN', quantity: p.stock, reason: 'Stock inicial' } }
      }
    });
  }

  console.log('Seed completado:', { admin: admin.email });
}

main().catch(console.error).finally(() => prisma.$disconnect());
