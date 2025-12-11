import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  tipo_documento: {
    type: String,
    required: [true, 'El tipo de documento es requerido'],
    enum: {
      values: ['DNI', 'RUC', 'CE', 'PASAPORTE'],
      message: '{VALUE} no es un tipo de documento válido'
    }
  },
  numero_documento: {
    type: String,
    required: [true, 'El número de documento es requerido'],
    unique: true,
    trim: true
  },
  nombres: {
    type: String,
    required: [true, 'Los nombres son requeridos'],
    trim: true,
    maxlength: [100, 'Los nombres no pueden exceder 100 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true,
    maxlength: [100, 'Los apellidos no pueden exceder 100 caracteres']
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede exceder 20 caracteres']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
clienteSchema.index({ numero_documento: 1 }, { unique: true });
clienteSchema.index({ email: 1 }, { sparse: true });
clienteSchema.index({ nombres: 'text', apellidos: 'text' });
clienteSchema.index({ estado: 1 });

// Virtual para nombre completo
clienteSchema.virtual('nombre_completo').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

clienteSchema.set('toJSON', { virtuals: true });
clienteSchema.set('toObject', { virtuals: true });

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;
