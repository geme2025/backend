import express from 'express';
import {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controllers/categoriaController.js';
import { protegerRuta, autorizarRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protegerRuta);

router
  .route('/')
  .get(getCategorias)
  .post(autorizarRoles('admin'), createCategoria);

router
  .route('/:id')
  .get(getCategoria)
  .put(autorizarRoles('admin'), updateCategoria)
  .delete(autorizarRoles('admin'), deleteCategoria);

export default router;
