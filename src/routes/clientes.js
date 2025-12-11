import express from 'express';
import {
  getClientes,
  getCliente,
  buscarPorDocumento,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clienteController.js';
import { protegerRuta, autorizarRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protegerRuta);

router
  .route('/')
  .get(getClientes)
  .post(createCliente);

router
  .route('/buscar/:documento')
  .get(buscarPorDocumento);

router
  .route('/:id')
  .get(getCliente)
  .put(updateCliente)
  .delete(autorizarRoles('admin'), deleteCliente);

export default router;
