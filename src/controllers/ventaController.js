import Venta from '../models/Venta.js';
import Producto from '../models/Producto.js';

// @desc    Obtener todas las ventas
// @route   GET /api/ventas
// @access  Privado
export const getVentas = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      cliente,
      usuario,
      metodo_pago,
      estado,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Filtro por rango de fechas
    if (fecha_inicio || fecha_fin) {
      query.fecha_venta = {};
      if (fecha_inicio) {
        query.fecha_venta.$gte = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        query.fecha_venta.$lte = new Date(fecha_fin);
      }
    }

    // Filtro por cliente
    if (cliente) {
      query.cliente = cliente;
    }

    // Filtro por usuario
    if (usuario) {
      query.usuario = usuario;
    }

    // Filtro por método de pago
    if (metodo_pago) {
      query.metodo_pago = metodo_pago;
    }

    // Filtro por estado
    if (estado) {
      query.estado = estado;
    }

    const ventas = await Venta.find(query)
      .populate('cliente', 'nombres apellidos numero_documento')
      .populate('usuario', 'name email')
      .populate('items.producto', 'nombre codigo')
      .sort({ fecha_venta: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Venta.countDocuments(query);

    res.status(200).json({
      success: true,
      data: ventas,
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

// @desc    Obtener una venta por ID
// @route   GET /api/ventas/:id
// @access  Privado
export const getVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombres apellidos numero_documento telefono direccion')
      .populate('usuario', 'name email')
      .populate('items.producto', 'nombre codigo imagen');

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener venta por número de venta
// @route   GET /api/ventas/numero/:numero
// @access  Privado
export const getVentaPorNumero = async (req, res) => {
  try {
    const venta = await Venta.findOne({ numero_venta: req.params.numero })
      .populate('cliente', 'nombres apellidos numero_documento telefono direccion')
      .populate('usuario', 'name email')
      .populate('items.producto', 'nombre codigo imagen');

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nueva venta
// @route   POST /api/ventas
// @access  Privado
export const createVenta = async (req, res) => {
  try {
    const { cliente, items, metodo_pago, observaciones } = req.body;

    // Validar items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La venta debe tener al menos un producto'
      });
    }

    // Verificar stock y preparar items
    const itemsVenta = [];
    for (const item of items) {
      const producto = await Producto.findById(item.producto);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.producto} no encontrado`
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${producto.nombre}. Stock disponible: ${producto.stock}`
        });
      }

      // Calcular subtotal del item
      const subtotal = (item.cantidad * item.precio_unitario) - (item.descuento || 0);

      itemsVenta.push({
        producto: producto._id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento: item.descuento || 0,
        subtotal
      });

      // Reducir stock
      producto.stock -= item.cantidad;
      await producto.save();
    }

    // Calcular totales
    const subtotal = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0);
    const igv = subtotal * 0.18; // 18% IGV
    const total = subtotal + igv;

    // Generar número de venta
    const numero_venta = await Venta.generarNumeroVenta();

    // Crear venta
    const venta = await Venta.create({
      numero_venta,
      cliente,
      usuario: req.usuario._id,
      fecha_venta: new Date(),
      items: itemsVenta,
      subtotal,
      igv,
      total,
      metodo_pago,
      observaciones,
      estado: 'completada'
    });

    // Poblar referencias
    await venta.populate([
      { path: 'cliente', select: 'nombres apellidos numero_documento' },
      { path: 'usuario', select: 'name email' },
      { path: 'items.producto', select: 'nombre codigo' }
    ]);

    res.status(201).json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Anular venta
// @route   PUT /api/ventas/:id/anular
// @access  Privado (Admin)
export const anularVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    if (venta.estado === 'anulada') {
      return res.status(400).json({
        success: false,
        message: 'La venta ya está anulada'
      });
    }

    // Devolver stock
    for (const item of venta.items) {
      const producto = await Producto.findById(item.producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();
      }
    }

    venta.estado = 'anulada';
    await venta.save();

    res.status(200).json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de ventas
// @route   GET /api/ventas/stats/dashboard
// @access  Privado
export const getEstadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    // Ventas del día
    const ventasHoy = await Venta.aggregate([
      {
        $match: {
          fecha_venta: {
            $gte: new Date(hoy.setHours(0, 0, 0, 0)),
            $lte: new Date(hoy.setHours(23, 59, 59, 999))
          },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Ventas del mes
    const ventasMes = await Venta.aggregate([
      {
        $match: {
          fecha_venta: { $gte: inicioMes },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Ventas del año
    const ventasAnio = await Venta.aggregate([
      {
        $match: {
          fecha_venta: { $gte: inicioAnio },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Top productos vendidos
    const topProductos = await Venta.aggregate([
      { $match: { estado: 'completada' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.producto',
          nombre: { $first: '$items.nombre' },
          cantidad: { $sum: '$items.cantidad' },
          total: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        hoy: ventasHoy[0] || { total: 0, cantidad: 0 },
        mes: ventasMes[0] || { total: 0, cantidad: 0 },
        anio: ventasAnio[0] || { total: 0, cantidad: 0 },
        topProductos
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
