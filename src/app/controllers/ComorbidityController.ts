import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import Comorbidity from '../models/Comorbidity'

class ComorbidityController {
  public async index (req: Request, res: Response) {
    try {
      const comorbidities = await getRepository(Comorbidity).find()

      return res.json(comorbidities)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new ComorbidityController()
