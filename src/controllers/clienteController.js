import { prisma } from '../config/prisma.js';

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Privado
export const getClientes = async (req, res) => {
  try {
    const { tipo_documento, estado, search, page = 1, limit = 10 } = req.query;

    const where = {};

    // Filtro por tipo de documento
    if (tipo_documento) {
      where.tipo_documento = tipo_documento;
    }

    // Filtro por estado
    if (estado) {
      where.estado = estado === 'true';
    }

    // Búsqueda por documento, nombres, apellidos o email
    if (search) {
      where.OR = [
        { numero_documento: { contains: search, mode: 'insensitive' } },
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit * 1,
      skip: (page - 1) * limit
    });

    const total = await prisma.cliente.count({ where });

    res.status(200).json({
      success: true,
      data: clientes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/clientes/:id
// @access  Privado
export const getCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar cliente por número de documento
// @route   GET /api/clientes/buscar/:documento
// @access  Privado
export const buscarPorDocumento = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findFirst({
      where: { numero_documento: req.params.documento }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nuevo cliente
// @route   POST /api/clientes
// @access  Privado
export const createCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Privado
export const updateCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar cliente
// @route   DELETE /api/clientes/:id
// @access  Privado (Admin)
export const deleteCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
