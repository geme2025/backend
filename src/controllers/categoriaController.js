import { prisma } from '../config/prisma.js';

// @desc    Obtener todas las categorías
// @route   GET /api/categorias
// @access  Privado
export const getCategorias = async (req, res) => {
  try {
    const { estado, search, page = 1, limit = 10 } = req.query;

    const where = {};

    // Filtro por estado
    if (estado) {
      where.estado = estado === 'true';
    }

    // Búsqueda por nombre o descripción
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }

    const categorias = await prisma.categoria.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit * 1,
      skip: (page - 1) * limit
    });

    const total = await prisma.categoria.count({ where });

    res.status(200).json({
      success: true,
      data: categorias,
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

// @desc    Obtener una categoría por ID
// @route   GET /api/categorias/:id
// @access  Privado
export const getCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nueva categoría
// @route   POST /api/categorias
// @access  Privado (Admin)
export const createCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar categoría
// @route   PUT /api/categorias/:id
// @access  Privado (Admin)
export const updateCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });


    res.status(200).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar categoría
// @route   DELETE /api/categorias/:id
// @access  Privado (Admin)
export const deleteCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.delete({
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
