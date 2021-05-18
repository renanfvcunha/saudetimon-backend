import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import Status from '../models/Status'

class StatusController {
  public async index (req: Request, res: Response) {
    try {
      const status = await getRepository(Status).find({
        select: ['id', 'status']
      })

      return res.json(status)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new StatusController()
