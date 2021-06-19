import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface UserRequest extends Request {
  userId?: number
}

export default async (req: UserRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ msg: 'Token não enviado!' })
  }

  // Capturando token enviado
  const token = authHeader.split(' ')[1]

  // Verificando se o token enviado não foi alterado
  jwt.verify(token, process.env.APP_SECRET as string, (err, decoded) => {
    if (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'Token Inválido!' })
      }
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ msg: 'Token Expirado! Faça login novamente.' })
      }
    }

    if (decoded) {
      req.userId = decoded.id
      next()
    }
  })
}
