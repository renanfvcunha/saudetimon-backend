import { Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'
import path from 'path'
import { unlink } from 'fs'

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
      groupSlug,
      street,
      number,
      reference,
      neighborhood,
      phone,
      idComorbidity
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    const dropFiles = () =>
      new Promise<void>((resolve, reject) => {
        const uploadsPath = path.resolve(__dirname, '..', '..', '..', 'uploads')

        if (files.idDocFront) {
          unlink(
            path.resolve(uploadsPath, files.idDocFront[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }
        if (files.idDocVerse) {
          unlink(
            path.resolve(uploadsPath, files.idDocVerse[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }
        if (files.addressProof) {
          unlink(
            path.resolve(uploadsPath, files.addressProof[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }
        if (files.photo) {
          unlink(path.resolve(uploadsPath, files.photo[0].filename), err => {
            if (err) reject(err)
          })
        }
        if (files.medicalReport) {
          unlink(
            path.resolve(uploadsPath, files.medicalReport[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }
        if (files.medicalAuthorization) {
          unlink(
            path.resolve(uploadsPath, files.medicalAuthorization[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }
        if (files.medicalPrescription) {
          unlink(
            path.resolve(uploadsPath, files.medicalPrescription[0].filename),
            err => {
              if (err) reject(err)
            }
          )
        }

        resolve()
      })

    try {
      /** Verificando se os campos e arquivos obrigatórios foram preenchidos */
      if (
        !name ||
        !cpf ||
        !groupSlug ||
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
        await dropFiles()
        return res.status(400).json({
          msg:
            'Verifique se todos os campos e anexos obrigatórios foram preenchidos.'
        })
      }

      /** Buscando grupo informado no banco de dados e verificando se existe */
      const group = await getRepository(Group).findOne({
        where: { slug: groupSlug }
      })

      if (!group) {
        await dropFiles()
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
          await dropFiles()
          return res.status(400).json({
            msg: 'É necessário enviar laudo e autorização médicas.'
          })
        }
      }

      if (group.slug === 'comorbidades') {
        if (!idComorbidity) {
          await dropFiles()
          return res.status(400).json({
            msg: 'É necessário especificar a comorbidade.'
          })
        }
        if (!files.medicalReport && !files.medicalPrescription) {
          await dropFiles()
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
        await dropFiles()
        return res
          .status(400)
          .json({ msg: 'O CPF informado já foi cadastrado.' })
      }

      if (susCard && susCardCheck) {
        await dropFiles()
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
