import { Request, Response, NextFunction } from 'express'
import { getRepository, Not } from 'typeorm'
import { unlink } from 'fs'

import IPatient from '../../typescript/IPatient'
import Patient from '../models/Patient'
import Group from '../models/Group'
import IFiles from '../../typescript/IFiles'
import Category from '../models/Category'

class PatientValidator {
  public async store (req: Request, res: Response, next: NextFunction) {
    const {
      name,
      cpf,
      susCard,
      street,
      number,
      reference,
      neighborhood,
      phone,
      idCategory,
      idGroup,
      idComorbidity,
      renOncImun
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
        if (files.cpf) {
          unlink(files.cpf[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.addressProof) {
          unlink(files.addressProof[0].path, err => {
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
        if (files.workContract) {
          unlink(files.workContract[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.prenatalCard) {
          unlink(files.prenatalCard[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.puerperalCard) {
          unlink(files.puerperalCard[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.bornAliveDec) {
          unlink(files.bornAliveDec[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.auxDoc) {
          unlink(files.auxDoc[0].path, err => {
            if (err) reject(err)
          })
        }

        resolve()
      })

    try {
      /** Verificando se os campos obrigatórios foram preenchidos */
      if (
        !name ||
        !cpf ||
        !phone ||
        !street ||
        !number ||
        !reference ||
        !neighborhood ||
        !idCategory ||
        !idGroup
      ) {
        await dropFiles()
        return res.status(400).json({
          msg: 'Verifique se todos os campos obrigatórios foram preenchidos.'
        })
      }

      /** Buscando a categoria informada no banco de dados e verificando se existe */
      const category = await getRepository(Category).findOne(idCategory)

      if (!category) {
        await dropFiles()
        return res
          .status(400)
          .json({ msg: 'A categoria informada não foi encontrada.' })
      }

      /** Buscando grupo informado no banco de dados e verificando se existe */
      const group = await getRepository(Group).findOne(idGroup, {
        where: { category }
      })

      if (!group) {
        await dropFiles()
        return res.status(400).json({
          msg: `O grupo informado não foi encontrado ou não faz parte da categoria "${category.category}".`
        })
      }

      /** Verificando se arquivos obrigatórios foram enviados */
      if (
        !files.idDocFront ||
        !files.idDocVerse ||
        !files.cpf ||
        !files.addressProof
      ) {
        await dropFiles()
        return res.status(400).json({
          msg:
            'Verifique se todos os seguintes documentos foram enviados: Documento de Identificação (Frente), Documento de Identificação (Verso), CPF ou Cartão SUS e Comprovante de Endereço'
        })
      }

      /** Verificando se laudo médico foi enviado em caso de comorbidades */
      if (idComorbidity && !files.medicalReport) {
        await dropFiles()
        return res
          .status(400)
          .json({ msg: 'Verifique se o laudo médico foi enviado.' })
      }

      /** Verificando se laudo e autorização médica foram enviados em caso de
       * paciente renal, oncológico ou imunossuprimido
       */
      if (JSON.parse(renOncImun) === true) {
        if (!files.medicalReport || !files.medicalAuthorization) {
          await dropFiles()
          return res.status(400).json({
            msg: 'Verifique se o laudo e autorização médica foram enviados.'
          })
        }
      }

      /** Verificando se contracheque ou contrato de trabalho foi enviado
       * para a categoria sobra de doses
       */
      if (category.category === 'Sobra de Doses') {
        if (!files.workContract) {
          await dropFiles()
          return res.status(400).json({
            msg:
              'Verifique se o contracheque ou contrato de trabalho foi enviado.'
          })
        }
      }

      /** Verificando se pre natal, puerperas e declaração de nascido vivo foram
       * enviados em caso de gestantes
       */
      if (group.group && /gestantes/i.test(group.group)) {
        if (!files.prenatalCard) {
          await dropFiles()
          return res.status(400).json({
            msg: 'Verifique se o Cartão de Pré Natal foi enviado.'
          })
        }
      }

      if (
        group.group &&
        group.group ===
          'Gestantes e puérperas a partir de 18 anos COM comorbidades'
      ) {
        if (!files.puerperalCard || !files.bornAliveDec) {
          await dropFiles()
          return res.status(400).json({
            msg:
              'Verifique se o Cartão de Puérperas e a Declaração de Nascido Vivo foram enviados.'
          })
        }
      }

      /** Verificando se contrato com o paciente ou declaração autenticada em
       * cartório foi enviado em caso de profissional de saúde autônomo
       */
      /* if (
        group.group &&
        group.group === 'Profissionais da área da saúde - autônomos'
      ) {
        if (!files.patientContract) {
          await dropFiles()
          return res.status(400).json({
            msg:
              'Necessário enviar contrato com o paciente ou declaração autenticada em cartório.'
          })
        }
      } */

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
        if (files.cpf) {
          unlink(files.cpf[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.addressProof) {
          unlink(files.addressProof[0].path, err => {
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
        if (files.workContract) {
          unlink(files.workContract[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.prenatalCard) {
          unlink(files.prenatalCard[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.puerperalCard) {
          unlink(files.puerperalCard[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.bornAliveDec) {
          unlink(files.bornAliveDec[0].path, err => {
            if (err) reject(err)
          })
        }
        if (files.auxDoc) {
          unlink(files.auxDoc[0].path, err => {
            if (err) reject(err)
          })
        }

        resolve()
      })

    try {
      /** Verificando se paciente pode ser atualizado */
      const patientUpdatable = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select(['patient.id'])
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .where('patient.id = :id', { id })
        .andWhere('status.status = :status', { status: 'Negado' })
        .getOne()

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
