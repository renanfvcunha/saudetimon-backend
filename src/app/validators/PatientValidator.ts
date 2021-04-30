import { Request, Response, NextFunction } from 'express'
import { getRepository, Not } from 'typeorm'
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
        if (files.idDocFront) {
          unlink(files.idDocFront[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.idDocVerse) {
          unlink(files.idDocVerse[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.addressProof) {
          unlink(files.addressProof[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.photo) {
          unlink(files.photo[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalReport) {
          unlink(files.medicalReport[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalAuthorization) {
          unlink(files.medicalAuthorization[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalPrescription) {
          unlink(files.medicalPrescription[0].path, err => {
            if (err) reject(err)
          })
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

  public async update (req: Request, res: Response, next: NextFunction) {
    const { id } = req.params
    const {
      name,
      cpf,
      susCard,
      street,
      number,
      reference,
      neighborhood,
      phone
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    const dropFiles = () =>
      new Promise<void>((resolve, reject) => {
        if (files.idDocFront) {
          unlink(files.idDocFront[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.idDocVerse) {
          unlink(files.idDocVerse[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.addressProof) {
          unlink(files.addressProof[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.photo) {
          unlink(files.photo[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalReport) {
          unlink(files.medicalReport[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalAuthorization) {
          unlink(files.medicalAuthorization[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.medicalPrescription) {
          unlink(files.medicalPrescription[0].path, err => {
            if (err) reject(err)
          })
        }

        resolve()
      })

    try {
      /** Verificando se paciente pode ser atualizado */
      const patientUpdatable = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select(['patient.id', 'patientStatus.status'])
        .innerJoin('patient.patientStatus', 'patientStatus')
        .where('patient.id = :id', { id })
        .andWhere('patientStatus.status = 3')
        .getRawOne()

      if (!patientUpdatable) {
        await dropFiles()
        return res.status(401).json({
          msg:
            'Seu cadastro ainda está em análise ou já foi aprovado, portanto não é possível editá-lo.'
        })
      }

      /** Verificando se os campos e arquivos obrigatórios foram preenchidos */
      if (
        !name ||
        !cpf ||
        !phone ||
        !street ||
        !number ||
        !reference ||
        !neighborhood
      ) {
        await dropFiles()
        return res.status(400).json({
          msg:
            'Verifique se todos os campos e anexos obrigatórios foram preenchidos.'
        })
      }

      /** Verificanco se cpf e cartão sus já estão cadastrados */
      const cpfCheck = await getRepository(Patient).findOne({
        where: { cpf, id: Not(id) }
      })
      const susCardCheck = await getRepository(Patient).findOne({
        where: { susCard, id: Not(id) }
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
