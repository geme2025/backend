import { prisma } from '../config/prisma.js';

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Privado
export const getProductos = async (req, res) => {
  try {
    const { categoria, estado, stock_bajo, search, page = 1, limit = 10 } = req.query;

    const where = {};

    // Filtro por categoría
    if (categoria) {
      where.categoriaId = parseInt(categoria);
    }

    // Filtro por estado
    if (estado) {
      where.estado = estado === 'true';
    }

    // Filtro por stock bajo
    if (stock_bajo === 'true') {
      where.stock = { lte: 'stock_minimo' };
    }

    // Búsqueda por código, nombre o descripción
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }

    const productos = await prisma.producto.findMany({
      where,
      include: { categoria: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit * 1,
      skip: (page - 1) * limit
    });

    const total = await prisma.producto.count({ where });

    res.status(200).json({
      success: true,
      data: productos,
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

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Privado
export const getProducto = async (req, res) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { categoria: { select: { nombre: true, descripcion: true } } }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/productos
// @access  Privado (Admin)
export const createProducto = async (req, res) => {
  try {
    const producto = await prisma.producto.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/productos/:id
// @access  Privado (Admin)
export const updateProducto = async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { categoria: { select: { nombre: true } } }
    });

    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/productos/:id
// @access  Privado (Admin)
export const deleteProducto = async (req, res) => {
  try {
    const producto = await prisma.producto.delete({
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

// @desc    Actualizar stock del producto
// @route   PATCH /api/productos/:id/stock
// @access  Privado
export const updateStock = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body;

    if (!cantidad || !operacion) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cantidad y operación (sumar o restar)'
      });
    }

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let nuevoStock = producto.stock;

    if (operacion === 'sumar') {
      nuevoStock += parseInt(cantidad);
    } else if (operacion === 'restar') {
      if (producto.stock < cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente'
        });
      }
      nuevoStock -= parseInt(cantidad);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operación inválida. Use "sumar" o "restar"'
      });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { stock: nuevoStock }
    });

    res.status(200).json({
      success: true,
      data: productoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
