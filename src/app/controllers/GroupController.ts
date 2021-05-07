import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import Category from '../models/Category'

import Group from '../models/Group'

class GroupController {
  public async index (req: Request, res: Response) {
    const { idCategory } = req.query

    try {
      if (idCategory) {
        const category = await getRepository(Category).findOne(
          Number(idCategory)
        )

        if (!category) {
          return res.status(400).json({ msg: 'Categoria não encontrada.' })
        }

        const groups = await getRepository(Group)
          .createQueryBuilder('group')
          .select(['group.id', 'group.group'])
          .innerJoin('group.category', 'category')
          .where('category.id = :idCategory', { idCategory })
          .getMany()

        return res.json(groups)
      } else {
        const groups = await getRepository(Group).find()

        return res.json(groups)
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new GroupController()
