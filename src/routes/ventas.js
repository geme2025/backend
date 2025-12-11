import express from 'express';
import {
  getVentas,
  getVenta,
  getVentaPorNumero,
  createVenta,
  anularVenta,
  getEstadisticas
} from '../controllers/ventaController.js';
import { protegerRuta, autorizarRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protegerRuta);

router
  .route('/')
  .get(getVentas)
  .post(createVenta);

router
  .route('/stats/dashboard')
  .get(getEstadisticas);

router
  .route('/numero/:numero')
  .get(getVentaPorNumero);

router
  .route('/:id')
  .get(getVenta);

router
  .route('/:id/anular')
  .put(autorizarRoles('admin'), anularVenta);

export default router;
