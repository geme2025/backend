import { prisma } from '../config/prisma.js';

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

    const where = {};

    // Filtro por rango de fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha_venta = {};
      if (fecha_inicio) {
        where.fecha_venta.gte = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        where.fecha_venta.lte = new Date(fecha_fin);
      }
    }

    // Filtro por cliente
    if (cliente) {
      where.clienteId = parseInt(cliente);
    }

    // Filtro por usuario
    if (usuario) {
      where.usuarioId = parseInt(usuario);
    }

    // Filtro por método de pago
    if (metodo_pago) {
      where.metodo_pago = metodo_pago;
    }

    // Filtro por estado
    if (estado) {
      where.estado = estado;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const ventas = await prisma.venta.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            numero_documento: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        }
      },
      orderBy: { fecha_venta: 'desc' },
      skip,
      take: limitNum
    });

    const total = await prisma.venta.count({ where });

    res.status(200).json({
      success: true,
      data: ventas,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
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
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            numero_documento: true,
            telefono: true,
            direccion: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                imagen: true
              }
            }
          }
        }
      }
    });

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
    const venta = await prisma.venta.findFirst({
      where: { numero_venta: req.params.numero },
      include: {
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            numero_documento: true,
            telefono: true,
            direccion: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                imagen: true
              }
            }
          }
        }
      }
    });

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
      const producto = await prisma.producto.findUnique({
        where: { id: parseInt(item.producto) }
      });

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
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento: item.descuento || 0,
        subtotal
      });

      // Reducir stock
      await prisma.producto.update({
        where: { id: producto.id },
        data: { stock: producto.stock - item.cantidad }
      });
    }

    // Calcular totales
    const subtotal = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0);
    const igv = subtotal * 0.18; // 18% IGV
    const total = subtotal + igv;

    // Generar número de venta
    const ultimaVenta = await prisma.venta.findFirst({
      orderBy: { id: 'desc' },
      take: 1
    });
    const numero_venta = ultimaVenta ? `V${String(ultimaVenta.id + 1).padStart(6, '0')}` : 'V000001';

    // Crear venta
    const venta = await prisma.venta.create({
      data: {
        numero_venta,
        clienteId: parseInt(cliente),
        usuarioId: parseInt(req.usuario.id),
        fecha_venta: new Date(),
        items: {
          createMany: {
            data: itemsVenta
          }
        },
        subtotal,
        igv,
        total,
        metodo_pago,
        observaciones,
        estado: 'completada'
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            numero_documento: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        }
      }
    });

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
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });

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
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      });
      if (producto) {
        await prisma.producto.update({
          where: { id: item.productoId },
          data: { stock: producto.stock + item.cantidad }
        });
      }
    }

    const ventaActualizada = await prisma.venta.update({
      where: { id: parseInt(req.params.id) },
      data: { estado: 'anulada' }
    });

    res.status(200).json({
      success: true,
      data: ventaActualizada
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
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    // Ventas del día
    const ventasHoy = await prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: inicioHoy,
          lte: finHoy
        },
        estado: 'completada'
      },
      _sum: { total: true },
      _count: true
    });

    // Ventas del mes
    const ventasMes = await prisma.venta.aggregate({
      where: {
        fecha_venta: { gte: inicioMes },
        estado: 'completada'
      },
      _sum: { total: true },
      _count: true
    });

    // Ventas del año
    const ventasAnio = await prisma.venta.aggregate({
      where: {
        fecha_venta: { gte: inicioAnio },
        estado: 'completada'
      },
      _sum: { total: true },
      _count: true
    });

    // Top productos vendidos
    const topProductos = await prisma.ventaItem.groupBy({
      by: ['productoId'],
      where: {
        venta: {
          estado: 'completada'
        }
      },
      _sum: {
        cantidad: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 10
    });

    // Obtener detalles de productos
    const topProductosDetallados = await Promise.all(
      topProductos.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: { nombre: true }
        });
        return {
          productoId: item.productoId,
          nombre: producto?.nombre,
          cantidad: item._sum.cantidad,
          total: item._sum.subtotal
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        hoy: {
          total: ventasHoy._sum.total || 0,
          cantidad: ventasHoy._count || 0
        },
        mes: {
          total: ventasMes._sum.total || 0,
          cantidad: ventasMes._count || 0
        },
        anio: {
          total: ventasAnio._sum.total || 0,
          cantidad: ventasAnio._count || 0
        },
        topProductos: topProductosDetallados
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
