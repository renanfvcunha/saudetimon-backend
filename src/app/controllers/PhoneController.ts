import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import Phone from '../models/Phone'

class PhoneController {
  public async index (req: Request, res: Response) {
    try {
      const phones = await getRepository(Phone).find({
        select: ['id', 'name', 'phone'],
        order: { createdAt: 'ASC' }
      })

      return res.json(phones)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { name, phone }: Phone = req.body

    try {
      const phn = new Phone()
      phn.name = name
      phn.phone = phone

      await getRepository(Phone).save(phn)

      return res.json({ msg: 'Contato adicionado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { name, phone }: Phone = req.body

    try {
      const phn = new Phone()
      phn.name = name
      phn.phone = phone

      await getRepository(Phone).update(id, phn)

      return res.json({ msg: 'Contato alterado com sucesso!' })
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
      await getRepository(Phone).delete(id)

      return res.json({ msg: 'Contato removido com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PhoneController()
