import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import Category from '../models/Category'

class CategoryController {
  public async index (req: Request, res: Response) {
    try {
      const categories = await getRepository(Category).find()

      return res.json(categories)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new CategoryController()
