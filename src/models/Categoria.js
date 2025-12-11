import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
categoriaSchema.index({ nombre: 1 });
categoriaSchema.index({ estado: 1 });

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;
