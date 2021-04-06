import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import Group from '../models/Group'

class GroupController {
  public async index (req: Request, res: Response) {
    try {
      const groups = await getRepository(Group).find()

      return res.json(groups)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new GroupController()
