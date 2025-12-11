import Cliente from '../models/Cliente.js';

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Privado
export const getClientes = async (req, res) => {
  try {
    const { tipo_documento, estado, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filtro por tipo de documento
    if (tipo_documento) {
      query.tipo_documento = tipo_documento;
    }

    // Filtro por estado
    if (estado) {
      query.estado = estado === 'true';
    }

    // Búsqueda por documento, nombres, apellidos o email
    if (search) {
      query.$or = [
        { numero_documento: { $regex: search, $options: 'i' } },
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clientes = await Cliente.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Cliente.countDocuments(query);

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
    const cliente = await Cliente.findById(req.params.id);

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
    const cliente = await Cliente.findOne({ numero_documento: req.params.documento });

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
    const cliente = await Cliente.create(req.body);

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
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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

// @desc    Eliminar cliente
// @route   DELETE /api/clientes/:id
// @access  Privado (Admin)
export const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.deleteOne();

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
