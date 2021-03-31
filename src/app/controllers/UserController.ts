import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import bcrypt from 'bcryptjs'

import User from '../models/User'
import IUser from '../../typescript/IUser'

class UserController {
  public async index (req: Request, res: Response) {
    try {
      const users = await getRepository(User).find({
        select: ['id', 'name', 'username', 'admin']
      })

      return res.json(users)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { name, username, admin, password }: IUser = req.body

    try {
      const hash = await bcrypt.hash(password, 8)

      const user = new User()

      user.name = name
      user.username = username
      user.admin = admin
      user.password = hash

      await getRepository(User).save(user)

      return res.json({ msg: 'Usuário cadastrado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async show (req: Request, res: Response) {
    const { id } = req.params

    try {
      const user = await getRepository(User).findOne(id, {
        select: ['id', 'name', 'username', 'admin']
      })

      return res.json(user)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { name, username, admin, password }: IUser = req.body

    try {
      const user = new User()

      user.name = name
      user.username = username
      user.admin = admin
      if (password) {
        const hash = await bcrypt.hash(password, 8)
        user.password = hash
      }

      await getRepository(User).update(id, user)

      return res.json({ msg: 'Usuário atualizado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async destroy (req: Request, res: Response) {
    const { id } = req.params

    try {
      await getRepository(User).softDelete(id)

      return res.json({ msg: 'Usuário removido com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new UserController()
