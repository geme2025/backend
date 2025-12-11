import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Privado (solo Admin)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Crear usuario
    const usuario = await User.create({
      name,
      email,
      password,
      role: role || 'vendedor'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        token: generarToken(usuario._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Público
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña'
      });
    }

    // Verificar usuario
    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }

    // Verificar contraseña
    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        token: generarToken(usuario._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Privado
export const getMe = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/updateprofile
// @access  Privado
export const updateProfile = async (req, res) => {
  try {
    const camposActualizar = {
      name: req.body.name,
      email: req.body.email
    };

    const usuario = await User.findByIdAndUpdate(
      req.usuario._id,
      camposActualizar,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Privado
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione la contraseña actual y la nueva'
      });
    }

    const usuario = await User.findById(req.usuario._id).select('+password');

    // Verificar contraseña actual
    const passwordValido = await usuario.compararPassword(currentPassword);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    usuario.password = newPassword;
    await usuario.save();

    res.status(200).json({
      success: true,
      data: {
        _id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        token: generarToken(usuario._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
