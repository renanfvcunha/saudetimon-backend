import { Request, Response } from 'express'
import { getRepository, Not } from 'typeorm'

import Comorbidity from '../models/Comorbidity'

class ComorbidityController {
  public async index (req: Request, res: Response) {
    try {
      const comorbidities = await getRepository(Comorbidity).find({
        order: { id: 'ASC' }
      })

      return res.json(comorbidities)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { comorbidity }: Comorbidity = req.body

    try {
      /** Verificando se comorbidade já existe */
      const cmbExists = await getRepository(Comorbidity).findOne({
        where: { comorbidity }
      })

      if (cmbExists) {
        return res
          .status(400)
          .json({ msg: 'A comorbidade informada já está cadastrada.' })
      }

      const cmb = new Comorbidity()
      cmb.comorbidity = comorbidity

      await getRepository(Comorbidity).save(cmb)

      return res.json({ msg: 'Comorbidade Cadastrada com Sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { comorbidity }: Comorbidity = req.body

    try {
      /** Verificando se comorbidade já existe */
      const cmbExists = await getRepository(Comorbidity).findOne({
        where: { comorbidity, id: Not(id) }
      })

      if (cmbExists) {
        return res
          .status(400)
          .json({ msg: 'A comorbidade informada já está cadastrada.' })
      }

      const cmb = new Comorbidity()
      cmb.comorbidity = comorbidity

      await getRepository(Comorbidity).update(id, cmb)

      return res.json({ msg: 'Comorbidade editada com sucesso!' })
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
      await getRepository(Comorbidity).delete(id)

      return res.json({ msg: 'Comorbidade removida com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new ComorbidityController()
