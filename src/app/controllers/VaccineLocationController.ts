import { Request, Response } from 'express'
import { getRepository } from 'typeorm'

import VaccineLocation from '../models/VaccineLocation'

class VaccineLocationControler {
  public async index (req: Request, res: Response) {
    try {
      const vaccineLocations = await getRepository(VaccineLocation).find({
        select: ['id', 'name', 'helperText', 'picture', 'url'],
        order: { createdAt: 'ASC' }
      })

      return res.json(vaccineLocations)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const { name, helperText, url }: VaccineLocation = req.body
    const file = req.file

    try {
      /** Verificando se todos os campos estão preenchidos */
      if (!name || !helperText || !file || !url) {
        return res
          .status(400)
          .json({ msg: 'Verifique se todos os campos estão preenchidos.' })
      }

      /** Verificando se url excede 200 caracteres */
      if (url.length > 200) {
        return res
          .status(400)
          .json({ msg: 'URL não pode exceder 200 caracteres.' })
      }

      const vacLoc = new VaccineLocation()
      vacLoc.name = name
      vacLoc.helperText = helperText
      vacLoc.picture = file.filename
      vacLoc.url = url

      await getRepository(VaccineLocation).save(vacLoc)

      return res.json({ msg: 'Local de vacinação adicionado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const { name, helperText, url }: VaccineLocation = req.body
    const file = req.file

    /** Verificando se todos os campos estão preenchidos */
    if (!name || !helperText || !url) {
      return res.status(400).json({
        msg: 'Verifique se todos os campos de texto estão preenchidos.'
      })
    }

    /** Verificando se url excede 200 caracteres */
    if (url.length > 200) {
      return res
        .status(400)
        .json({ msg: 'URL não pode exceder 200 caracteres.' })
    }

    try {
      const vacLoc = new VaccineLocation()
      vacLoc.name = name
      vacLoc.helperText = helperText
      if (file) {
        vacLoc.picture = file.filename
      }
      vacLoc.url = url

      await getRepository(VaccineLocation).update(id, vacLoc)

      return res.json({ msg: 'Local de vacinação alterado com sucesso!' })
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
      await getRepository(VaccineLocation).delete(id)

      return res.json({ msg: 'Local de vacinação removido com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new VaccineLocationControler()
