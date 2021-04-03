import { Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'
import User from '../models/User'

interface UserRequest extends Request {
  userId?: number
}

export default async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.userId

  const admin = await getRepository(User).findOne(id, {
    where: { admin: true }
  })

  if (!admin) {
    return res.status(403).json({ msg: 'Usuário não autorizado!' })
  }

  next()
}
