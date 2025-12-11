import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.usuario = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          activo: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!req.usuario || !req.usuario.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autorizado o inactivo'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó token de autenticación'
    });
  }
};

export const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.usuario.role} no tiene permiso para acceder a este recurso`
      });
    }
    next();
  };
};
