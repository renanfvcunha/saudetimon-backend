import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import IUser from '../../typescript/IUser'
import User from '../models/User'

class SessionController {
  public async store (req: Request, res: Response) {
    const { username, password }: IUser = req.body

    try {
      /** Verificando se os campos foram enviados */
      if (!username || !password) {
        return res.status(400).json({
          msg: 'Verifique se os campos estão corretamente preenchidos.'
        })
      }

      /** Verificando se usuário foi encontrado */
      const verifyUser = await getRepository(User).findOne({
        where: { username }
      })

      if (!verifyUser) {
        return res.status(401).json({ msg: 'Usuário e/ou senha incorretos' })
      }

      /** Verificando se senha está correta */
      const verifyPass = await bcrypt.compare(
        password,
        verifyUser.password as string
      )

      if (!verifyPass) {
        return res.status(401).json({ msg: 'Usuário e/ou senha incorretos' })
      }

      const { id, name, admin } = verifyUser

      /** Retornando usuário com token de autenticação */
      return res.json({
        user: { id, name, admin },
        token: jwt.sign({ id }, process.env.APP_SECRET as string, {
          expiresIn: '7d'
        })
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new SessionController()
