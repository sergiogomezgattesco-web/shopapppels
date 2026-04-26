import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search } = req.query;
    const products = await productService.getProducts(categoryId as string, search as string);
    res.json(products);
  } catch (err) { next(err); }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) { next(err); }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) { next(err); }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity, reason } = req.body;
    const stock = await productService.adjustStock(req.params.id, quantity, reason);
    res.json(stock);
  } catch (err) { next(err); }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await productService.getCategories();
    res.json(categories);
  } catch (err) { next(err); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await productService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (err) { next(err); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};
