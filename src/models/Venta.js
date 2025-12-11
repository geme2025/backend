import mongoose from 'mongoose';

const ventaSchema = new mongoose.Schema({
  numero_venta: {
    type: String,
    required: [true, 'El número de venta es requerido'],
    unique: true,
    trim: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    default: null
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  fecha_venta: {
    type: Date,
    default: Date.now
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    codigo: String,
    nombre: String,
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser mayor a 0']
    },
    precio_unitario: {
      type: Number,
      required: true,
      min: [0, 'El precio unitario no puede ser negativo']
    },
    descuento: {
      type: Number,
      default: 0,
      min: [0, 'El descuento no puede ser negativo']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo']
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'El subtotal es requerido'],
    min: [0, 'El subtotal no puede ser negativo']
  },
  igv: {
    type: Number,
    required: [true, 'El IGV es requerido'],
    min: [0, 'El IGV no puede ser negativo']
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  metodo_pago: {
    type: String,
    required: [true, 'El método de pago es requerido'],
    enum: {
      values: ['efectivo', 'tarjeta', 'yape', 'plin', 'transferencia'],
      message: '{VALUE} no es un método de pago válido'
    }
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'completada', 'anulada'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'completada'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true
});

// Índices
ventaSchema.index({ numero_venta: 1 }, { unique: true });
ventaSchema.index({ fecha_venta: -1 });
ventaSchema.index({ estado: 1, fecha_venta: -1 });
ventaSchema.index({ cliente: 1 });
ventaSchema.index({ usuario: 1 });
ventaSchema.index({ metodo_pago: 1 });

// Método estático para generar número de venta
ventaSchema.statics.generarNumeroVenta = async function() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  const ultimaVenta = await this.findOne({
    numero_venta: new RegExp(`^V${year}${month}`)
  }).sort({ numero_venta: -1 });

  let numero = 1;
  if (ultimaVenta) {
    const ultimoNumero = parseInt(ultimaVenta.numero_venta.slice(-6));
    numero = ultimoNumero + 1;
  }

  return `V${year}${month}${String(numero).padStart(6, '0')}`;
};

const Venta = mongoose.model('Venta', ventaSchema);

export default Venta;
