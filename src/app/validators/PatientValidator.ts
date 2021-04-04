import { Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'
import { resolve } from 'path'
import { unlinkSync } from 'fs'

import IPatient from '../../typescript/IPatient'
import Patient from '../models/Patient'
import Group from '../models/Group'
import IFiles from '../../typescript/IFiles'

class PatientValidator {
  public async store (req: Request, res: Response, next: NextFunction) {
    const {
      name,
      cpf,
      susCard,
      idGroup,
      street,
      number,
      reference,
      neighborhood,
      phone,
      idComorbidity
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    const dropFiles = () => {
      const uploadsPath = resolve(__dirname, '..', '..', '..', 'uploads')

      unlinkSync(resolve(uploadsPath, files.idDocFront[0].filename))
      unlinkSync(resolve(uploadsPath, files.idDocVerse[0].filename))
      unlinkSync(resolve(uploadsPath, files.addressProof[0].filename))
      unlinkSync(resolve(uploadsPath, files.photo[0].filename))
      if (files.medicalReport) {
        unlinkSync(resolve(uploadsPath, files.medicalReport[0].filename))
      }
      if (files.medicalAuthorization) {
        unlinkSync(resolve(uploadsPath, files.medicalAuthorization[0].filename))
      }
      if (files.medicalPrescription) {
        unlinkSync(resolve(uploadsPath, files.medicalPrescription[0].filename))
      }
    }

    try {
      /** Verificando se os campos e arquivos obrigatórios foram preenchidos */
      if (
        !name ||
        !cpf ||
        !idGroup ||
        !street ||
        !number ||
        !reference ||
        !neighborhood ||
        !phone ||
        !files.idDocFront ||
        !files.idDocVerse ||
        !files.addressProof ||
        !files.photo
      ) {
        dropFiles()
        return res.status(400).json({
          msg: 'Verifique se todos os campos obrigatórios foram preenchidos.'
        })
      }

      /** Buscando grupo informado no banco de dados e verificando se existe */
      const group = await getRepository(Group).findOne(idGroup)

      if (!group) {
        dropFiles()
        return res
          .status(400)
          .json({ msg: 'O grupo informado não foi encontrado.' })
      }

      /** Verificando se arquivos obrigatórios foram enviados */
      if (
        group.slug === 'paciente_oncologico' ||
        group.slug === 'paciente_renal'
      ) {
        if (!files.medicalReport || !files.medicalAuthorization) {
          dropFiles()
          return res.status(400).json({
            msg: 'É necessário enviar laudo e autorização médicas.'
          })
        }
      }

      if (group.slug === 'comorbidades') {
        if (!idComorbidity) {
          dropFiles()
          return res.status(400).json({
            msg: 'É necessário especificar a comorbidade.'
          })
        }
        if (!files.medicalReport && !files.medicalPrescription) {
          dropFiles()
          return res.status(400).json({
            msg: 'É necessário enviar um laudo ou alguma prescrição médica.'
          })
        }
      }

      /** Verificanco se cpf e cartão sus já estão cadastrados */
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
