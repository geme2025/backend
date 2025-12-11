import Producto from '../models/Producto.js';

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Privado
export const getProductos = async (req, res) => {
  try {
    const { categoria, estado, stock_bajo, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtro por estado
    if (estado) {
      query.estado = estado === 'true';
    }

    // Filtro por stock bajo
    if (stock_bajo === 'true') {
      query.$expr = { $lte: ['$stock', '$stock_minimo'] };
    }

    // Búsqueda por código, nombre o descripción
    if (search) {
      query.$or = [
        { codigo: { $regex: search, $options: 'i' } },
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    const productos = await Producto.find(query)
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Producto.countDocuments(query);

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
    const producto = await Producto.findById(req.params.id).populate('categoria', 'nombre descripcion');

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
    const producto = await Producto.create(req.body);

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
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categoria', 'nombre');

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

// @desc    Eliminar producto
// @route   DELETE /api/productos/:id
// @access  Privado (Admin)
export const deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await producto.deleteOne();

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

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (operacion === 'sumar') {
      producto.stock += parseInt(cantidad);
    } else if (operacion === 'restar') {
      if (producto.stock < cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente'
        });
      }
      producto.stock -= parseInt(cantidad);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operación inválida. Use "sumar" o "restar"'
      });
    }

    await producto.save();

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
