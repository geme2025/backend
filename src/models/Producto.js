import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es requerida']
  },
  codigo: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'El código no puede exceder 50 caracteres']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  precio_compra: {
    type: Number,
    required: [true, 'El precio de compra es requerido'],
    min: [0, 'El precio de compra no puede ser negativo']
  },
  precio_venta: {
    type: Number,
    required: [true, 'El precio de venta es requerido'],
    min: [0, 'El precio de venta no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  stock_minimo: {
    type: Number,
    default: 5,
    min: [0, 'El stock mínimo no puede ser negativo']
  },
  imagen: {
    type: String,
    default: null
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
productoSchema.index({ codigo: 1 }, { unique: true });
productoSchema.index({ categoria: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ estado: 1, stock: 1 });

// Virtual para verificar stock bajo
productoSchema.virtual('stock_bajo').get(function() {
  return this.stock <= this.stock_minimo;
});

// Asegurar que los virtuals se incluyan en JSON
productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;
