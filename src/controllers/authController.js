import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

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
    const usuarioExiste = await prisma.user.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const usuario = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role || 'vendedor'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        token: generarToken(usuario.id)
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
    const usuario = await prisma.user.findUnique({
      where: { email }
    });

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
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        token: generarToken(usuario.id)
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
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id }
    });

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

    const usuario = await prisma.user.update({
      where: { id: req.usuario.id },
      data: camposActualizar
    });

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

    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id }
    });

    // Verificar contraseña actual
    const passwordValido = await bcrypt.compare(currentPassword, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const usuarioActualizado = await prisma.user.update({
      where: { id: req.usuario.id },
      data: { password: passwordHash }
    });

    res.status(200).json({
      success: true,
      data: {
        id: usuarioActualizado.id,
        name: usuarioActualizado.name,
        email: usuarioActualizado.email,
        role: usuarioActualizado.role,
        token: generarToken(usuarioActualizado.id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
