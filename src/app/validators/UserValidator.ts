import { Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'

import IUser from '../../typescript/IUser'
import User from '../models/User'

class UserValidator {
  public async store (req: Request, res: Response, next: NextFunction) {
    const { name, username, password, passwordConf }: IUser = req.body

    // Verificando se todos os campos estão preenchidos
    if (!name || !username || !password || !passwordConf) {
      return res.status(400).json({
        msg: 'Verifique se todos os campos estão preenchidos corretamente!'
      })
    }

    /** Verificando se senhas coincidem */
    if (password !== passwordConf) {
      return res.status(400).json({ msg: 'Senhas não coincidem!' })
    }

    /** Verificando se não há espaços no nome de usuário */
    const stringSpace = (string: string) => /\s/g.test(string)

    if (stringSpace(username)) {
      return res
        .status(400)
        .json({ msg: 'Nome de usuário não pode conter espaços!' })
    }

    // Verificando se não há usuário com mesmo username
    const usernameQuery = await getRepository(User).findOne({
      select: ['username'],
      where: { username }
    })
    if (usernameQuery) {
      return res.status(400).json({
        msg: 'O nome de usuário informado já está registrado.'
      })
    }

    next()
  }

  public async update (req: Request, res: Response, next: NextFunction) {
    const { name, username, password, passwordConf }: IUser = req.body
    const { id } = req.params

    /** Verificando se os campos obrigatórios estão preenchidos */
    if (!name || !username) {
      return res.status(400).json({
        msg:
          'Verifique se os campos obrigatórios estão preenchidos corretamente!'
      })
    }

    /** Verificando se a senha será alterada e, caso sim, se coincidem. */
    if (password || passwordConf) {
      if (password !== passwordConf) {
        return res.status(400).json({ msg: 'Senhas não coincidem!' })
      }
    }

    /** Verificando se não há espaços no nome de usuário */
    const stringSpace = (string: string) => /\s/g.test(string)

    if (stringSpace(username)) {
      return res
        .status(400)
        .json({ msg: 'Nome de usuário não pode conter espaços!' })
    }

    /** Verificando se usuário foi encontrado */
    const userQuery = await getRepository(User).findOne({
      select: ['username'],
      where: { id }
    })

    if (!userQuery) {
      return res.status(400).json({ msg: 'Usuário não encontrado.' })
    }

    /** Verificando se não há usuário com mesmo username */
    const usernameQuery = await getRepository(User).findOne({
      select: ['username'],
      where: { username }
    })
    if (usernameQuery && usernameQuery.username !== userQuery.username) {
      return res.status(400).json({
        msg: 'O nome de usuário informado já está registrado.'
      })
    }

    return next()
  }
}

export default new UserValidator()
