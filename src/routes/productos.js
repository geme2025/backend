import express from 'express';
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  updateStock
} from '../controllers/productoController.js';
import { protegerRuta, autorizarRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protegerRuta);

router
  .route('/')
  .get(getProductos)
  .post(autorizarRoles('admin'), createProducto);

router
  .route('/:id')
  .get(getProducto)
  .put(autorizarRoles('admin'), updateProducto)
  .delete(autorizarRoles('admin'), deleteProducto);

router
  .route('/:id/stock')
  .patch(updateStock);

export default router;
