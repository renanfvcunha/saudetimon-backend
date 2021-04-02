import { Express, Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'
import { resolve } from 'path'
import { unlinkSync } from 'fs'

import IPatient from '../../typescript/IPatient'
import Patient from '../models/Patient'

class PatientValidator {
  public async store (req: Request, res: Response, next: NextFunction) {
    const {
      cpf,
      susCard,
      idGroup,
      street,
      number,
      reference,
      neighborhood,
      phone
    }: IPatient = req.body
    const files: Express.Multer.File[] = JSON.parse(JSON.stringify(req.files))

    const dropFiles = () => {
      files.forEach(file => {
        unlinkSync(
          resolve(__dirname, '..', '..', '..', 'uploads', file.filename)
        )
      })
    }

    try {
      /** Verificando se os campos obrigatórios foram preenchidos */
      if (
        !cpf ||
        !idGroup ||
        !street ||
        !number ||
        !reference ||
        !neighborhood ||
        !phone
      ) {
        dropFiles()
        return res.status(400).json({
          msg: 'Verifique se todos os campos obrigatórios foram preenchidos.'
        })
      }

      const cpfCheck = await getRepository(Patient).findOne({ where: { cpf } })
      const susCardCheck = await getRepository(Patient).findOne({
        where: { susCard }
      })

      if (cpfCheck) {
        dropFiles()
        return res
          .status(400)
          .json({ msg: 'O CPF informado já foi cadastrado.' })
      }

      if (susCard && susCardCheck) {
        dropFiles()
        return res
          .status(400)
          .json({ msg: 'O Cartão SUS informado já foi cadastrado.' })
      }

      next()
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientValidator()
