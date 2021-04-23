import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import IFrequentDoubt from '../../typescript/IFrequentDoubt'

import FrequentDoubt from '../models/FrequentDoubt'

class FrequentDoubtController {
  public async index (req: Request, res: Response) {
    try {
      const doubts = await getRepository(FrequentDoubt).find({
        select: ['id', 'question', 'answer'],
        order: { createdAt: 'ASC' }
      })

      return res.json(doubts)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { question, answer }: IFrequentDoubt = req.body

    try {
      const doubt = new FrequentDoubt()
      doubt.question = question
      doubt.answer = answer

      await getRepository(FrequentDoubt).save(doubt)

      return res.json({ msg: 'Dúvida cadastrada com sucesso!' })
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
      const doubt = await getRepository(FrequentDoubt).findOne(id, {
        select: ['id', 'question', 'answer']
      })

      return res.json(doubt)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { question, answer }: IFrequentDoubt = req.body

    try {
      const doubt = new FrequentDoubt()
      doubt.question = question
      doubt.answer = answer

      await getRepository(FrequentDoubt).update(id, doubt)

      return res.json({ msg: 'Dúvida editada com sucesso!' })
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
      await getRepository(FrequentDoubt).delete(id)

      return res.json({ msg: 'Dúvida removida com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new FrequentDoubtController()
