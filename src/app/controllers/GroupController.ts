import { Request, Response } from 'express'
import { getRepository, Not } from 'typeorm'
import IGroup from '../../typescript/IGroup'
import Category from '../models/Category'

import Group from '../models/Group'

class GroupController {
  public async index (req: Request, res: Response) {
    const { idCategory, orderBy } = req.query

    try {
      const groups = await getRepository(Group)
        .createQueryBuilder('group')
        .select(['group.id', 'group.group', 'category'])
        .innerJoin('group.category', 'category')
        .where(idCategory ? 'category.id = :idCategory' : 'category.id > 0', {
          idCategory
        })
        .orderBy(orderBy ? `group.${orderBy}` : 'group.id', 'ASC')
        .getMany()

      return res.json(groups)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { idCategory, group }: IGroup = req.body

    try {
      /** Buscando categoria informada e verificando se existe */
      const category = await getRepository(Category).findOne(idCategory)

      if (!category) {
        return res
          .status(400)
          .json({ msg: 'A categoria informada não foi encontrada.' })
      }

      /** Verificando se comorbidade já existe */
      const grpExists = await getRepository(Group).findOne({
        where: { group, category }
      })

      if (grpExists) {
        return res
          .status(400)
          .json({ msg: 'O grupo informado já está cadastrado.' })
      }

      const grp = new Group()
      grp.group = group
      grp.category = category

      await getRepository(Group).save(grp)

      return res.json({ msg: 'Grupo Cadastrado com Sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { idCategory, group }: IGroup = req.body

    try {
      /** Buscando categoria informada e verificando se existe */
      const category = await getRepository(Category).findOne(idCategory)

      if (!category) {
        return res
          .status(400)
          .json({ msg: 'A categoria informada não foi encontrada.' })
      }

      /** Verificando se comorbidade já existe */
      const grpExists = await getRepository(Group).findOne({
        where: { group, category, id: Not(id) }
      })

      if (grpExists) {
        return res
          .status(400)
          .json({ msg: 'O grupo informado já está cadastrado.' })
      }

      const grp = new Group()
      grp.group = group
      grp.category = category

      await getRepository(Group).update(id, grp)

      return res.json({ msg: 'Grupo editado com sucesso!' })
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
      await getRepository(Group).delete(id)

      return res.json({ msg: 'Grupo removido com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new GroupController()
