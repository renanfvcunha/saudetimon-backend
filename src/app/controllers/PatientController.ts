import { Request, Response } from 'express'
import { getManager, getRepository } from 'typeorm'
import xl from 'excel4node'
import { resolve } from 'path'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { addHours, format, subHours } from 'date-fns'

import IFiles from '../../typescript/IFiles'
import IPatient from '../../typescript/IPatient'
import IPatientStatus from '../../typescript/IPatientStatus'

import Address from '../models/Address'
import Attachment from '../models/Attachment'
import Category from '../models/Category'
import Comorbidity from '../models/Comorbidity'
import ComorbidityPatient from '../models/ComorbidityPatient'
import Group from '../models/Group'
import Patient from '../models/Patient'
import PatientStatus from '../models/PatientStatus'
import Status from '../models/Status'

import pdf from '../../config/export/pdf'

import masks from '../../utils/masks'

class PatientController {
  public async index (req: Request, res: Response) {
    const {
      per_page,
      page,
      status,
      idCategory,
      idGroup,
      vaccinated
    } = req.query

    try {
      const patients = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patient.createdAt'
        ])
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .innerJoin('patient.category', 'category')
        .innerJoin('patient.group', 'group')
        .where(status ? 'status.status = :status' : 'status.status = status', {
          status
        })
        .andWhere(
          idCategory ? 'category.id = :idCategory' : 'category.id > 0',
          { idCategory }
        )
        .andWhere(idGroup ? 'group.id = :idGroup' : 'group.id > 0', { idGroup })
        .andWhere(
          vaccinated
            ? 'patient.vaccinated = :vaccinated'
            : 'patient.vaccinated = vaccinated',
          { vaccinated }
        )
        .orderBy('patient.createdAt')
        .take(per_page ? Number(per_page) : undefined)
        .skip(per_page && page ? Number(per_page) * Number(page) : undefined)
        .getManyAndCount()

      return res.json(patients)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async store (req: Request, res: Response) {
    const {
      name,
      cpf,
      susCard,
      phone,
      street,
      number,
      complement,
      reference,
      neighborhood,
      idCategory,
      idGroup,
      idComorbidity,
      renOncImun
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    try {
      /** Buscando categoria informada no banco de dados */
      const category = await getRepository(Category).findOne(idCategory)

      /** Buscando grupo informado no banco de dados */
      const group = await getRepository(Group).findOne(idGroup)

      /** Buscando Status 'Em Análise' */
      const analysis = await getRepository(Status).findOne({
        where: { status: 'Em Análise' }
      })

      /** Instanciando classes */
      const patient = new Patient()
      const address = new Address()
      const patientStatus = new PatientStatus()
      const comorbidityPatient = new ComorbidityPatient()

      address.street = street
      address.number = number
      if (complement) {
        address.complement = complement
      }
      address.reference = reference
      address.neighborhood = neighborhood

      patientStatus.status = analysis

      if (idComorbidity) {
        /** Buscando comorbidade informada */
        const comorbidity = await getRepository(Comorbidity).findOne(
          idComorbidity
        )

        comorbidityPatient.comorbidity = comorbidity
      }

      if (JSON.parse(renOncImun) === true) {
        comorbidityPatient.renOncImun = true
      }

      /** Criando array de anexos enviados */
      const attachments: Attachment[] = []

      if (files.idDocFront) {
        attachments.push({
          field: 'idDocFront',
          filename: files.idDocFront[0].filename
        })
      }
      if (files.idDocVerse) {
        attachments.push({
          field: 'idDocVerse',
          filename: files.idDocVerse[0].filename
        })
      }
      if (files.cpf) {
        attachments.push({
          field: 'cpf',
          filename: files.cpf[0].filename
        })
      }
      if (files.addressProof) {
        attachments.push({
          field: 'addressProof',
          filename: files.addressProof[0].filename
        })
      }
      if (files.medicalReport) {
        attachments.push({
          field: 'medicalReport',
          filename: files.medicalReport[0].filename
        })
      }
      if (files.medicalAuthorization) {
        attachments.push({
          field: 'medicalAuthorization',
          filename: files.medicalAuthorization[0].filename
        })
      }
      if (files.workContract) {
        attachments.push({
          field: 'workContract',
          filename: files.workContract[0].filename
        })
      }
      if (files.prenatalCard) {
        attachments.push({
          field: 'prenatalCard',
          filename: files.prenatalCard[0].filename
        })
      }
      if (files.puerperalCard) {
        attachments.push({
          field: 'puerperalCard',
          filename: files.puerperalCard[0].filename
        })
      }
      if (files.bornAliveDec) {
        attachments.push({
          field: 'bornAliveDec',
          filename: files.bornAliveDec[0].filename
        })
      }
      if (files.auxDoc) {
        attachments.push({
          field: 'auxDoc',
          filename: files.auxDoc[0].filename
        })
      }

      patient.name = name
      patient.cpf = cpf
      if (susCard) {
        patient.susCard = susCard
      }
      patient.phone = phone
      patient.address = address
      patient.category = category
      patient.group = group
      patient.patientStatus = patientStatus
      patient.comorbidityPatient = comorbidityPatient
      patient.attachment = attachments

      await getRepository(Patient).save(patient)

      return res.json({ msg: 'Cadastro efetuado com sucesso!' })
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
      const patient = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patient.susCard',
          'patient.phone',
          'patient.createdAt',
          'address.street',
          'address.number',
          'address.complement',
          'address.reference',
          'address.neighborhood',
          'attachment.field',
          'attachment.filename',
          'category.category',
          'group.id',
          'group.group',
          'comorbidityPatient',
          'comorbidity.comorbidity',
          'patientStatus.message',
          'status.id',
          'status.status'
        ])
        .innerJoin('patient.category', 'category')
        .innerJoin('patient.group', 'group')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .leftJoin('patient.address', 'address')
        .leftJoin('patient.attachment', 'attachment')
        .leftJoin('patient.comorbidityPatient', 'comorbidityPatient')
        .leftJoin('comorbidityPatient.comorbidity', 'comorbidity')
        .where('patient.id = :id', { id })
        .getOne()

      return res.json(patient)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async me (req: Request, res: Response) {
    const { cpf } = req.params

    try {
      const patient = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id as id',
          'patient.name as name',
          'patient.cpf as cpf',
          'patient.susCard as "susCard"',
          'patient.phone as phone',
          'address.street as street',
          'address.number as number',
          'address.complement as complement',
          'address.reference as reference',
          'address.neighborhood as neighborhood',
          'comorbidityPatient.renOncImun as "renOncImun"',
          'group.id as "idGroup"',
          'comorbidity.id as "idComorbidity"',
          'status.status as "status"'
        ])
        .innerJoin('patient.address', 'address')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .innerJoin('patient.group', 'group')
        .leftJoin('patient.comorbidityPatient', 'comorbidityPatient')
        .leftJoin('comorbidityPatient.comorbidity', 'comorbidity')
        .where('patient.cpf = :cpf', { cpf })
        .getRawOne()

      if (!patient) {
        return res
          .status(404)
          .json({ msg: 'CPF não encontrado na base de dados!' })
      }

      return res.json(patient)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async getStatus (req: Request, res: Response) {
    const { cpf } = req.params

    try {
      const patient = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.cpf',
          'category',
          'group.id',
          'group.group',
          'patientStatus.message',
          'patientStatus.status',
          'status.id',
          'status.status',
          'status.message'
        ])
        .innerJoin('patient.category', 'category')
        .innerJoin('patient.group', 'group')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .where('patient.cpf = :cpf', { cpf })
        .getOne()

      if (!patient) {
        return res
          .status(404)
          .json({ msg: 'CPF não encontrado na base de dados.' })
      }

      const approveds = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select(['patient.id'])
        .innerJoin('patient.category', 'category')
        .innerJoin('patient.group', 'group')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .where('category.category = :category', { category: 'Sobra de Doses' })
        .andWhere('status.status = :status', { status: 'Aprovado' })
        .andWhere('patient.vaccinated = :vaccinated', { vaccinated: false })
        .orderBy('patient.createdAt')
        .getMany()

      if (
        patient.category &&
        patient.category.category === 'Sobra de Doses' &&
        patient.patientStatus &&
        patient.patientStatus.status &&
        patient.patientStatus.status.status === 'Aprovado'
      ) {
        const position =
          approveds.findIndex(approved => approved.id === patient.id) + 1

        return res.json({ patient, position, approveds: approveds.length })
      } else {
        return res.json({ patient })
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async changeStatus (req: Request, res: Response) {
    const { id } = req.params
    const { idStatus, message }: IPatientStatus = req.body

    try {
      const patient = new Patient()
      const patientStatus = new PatientStatus()

      patientStatus.status = { id: idStatus }
      patientStatus.message = message

      patient.id = Number(id)
      patient.patientStatus = patientStatus

      await getRepository(Patient).save(patient)

      return res.json({ msg: 'Status alterado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async changeGroup (req: Request, res: Response) {
    const { id } = req.params
    const { idGroup }: { idGroup: string } = req.body

    try {
      // Buscando grupo com o id informado
      const group = await getRepository(Group).findOne(idGroup)

      if (!group) {
        return res
          .status(404)
          .json({ msg: 'O grupo informado não foi encontrado.' })
      }

      const patient = new Patient()

      patient.id = Number(id)
      patient.group = group

      await getRepository(Patient).save(patient)

      return res.json({ msg: 'Grupo alterado com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async update (req: Request, res: Response) {
    const { id } = req.params
    const {
      name,
      cpf,
      susCard,
      street,
      number,
      complement,
      reference,
      neighborhood,
      phone
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    try {
      /** Buscando paciente informado */
      const patientById = await getRepository(Patient).findOne(id)

      /** Buscando Status 'Em Análise' */
      const analysis = await getRepository(Status).findOne({
        where: { status: 'Em Análise' }
      })

      /** Buscando anexos já enviados */
      const attachmentSent = await getRepository(Attachment).find({
        where: { patient: patientById }
      })

      /** Instanciando classes */
      const patient = new Patient()
      const address = new Address()
      const patientStatus = new PatientStatus()

      address.street = street
      address.number = number
      if (complement) {
        address.complement = complement
      }
      address.reference = reference
      address.neighborhood = neighborhood

      patientStatus.status = analysis

      /** Setando dados do Paciente */
      patient.id = Number(id)
      patient.name = name
      patient.cpf = cpf
      if (susCard) {
        patient.susCard = susCard
      }
      patient.phone = phone
      patient.address = address
      patient.patientStatus = patientStatus

      /** Criando array de anexos enviados */
      const attachments: Attachment[] = []

      if (files.idDocFront) {
        const idDocFrontFound = attachmentSent.find(
          attch => attch.field === 'idDocFront'
        )
        if (idDocFrontFound) {
          attachments.push({
            id: idDocFrontFound.id,
            field: idDocFrontFound.field,
            filename: files.idDocFront[0].filename,
            patient: idDocFrontFound.patient
          })
        } else {
          attachments.push({
            field: 'idDocFront',
            filename: files.idDocFront[0].filename,
            patient: patientById
          })
        }
      }
      if (files.idDocVerse) {
        const idDocVerseFound = attachmentSent.find(
          attch => attch.field === 'idDocVerse'
        )
        if (idDocVerseFound) {
          attachments.push({
            id: idDocVerseFound.id,
            field: idDocVerseFound.field,
            filename: files.idDocVerse[0].filename,
            patient: idDocVerseFound.patient
          })
        } else {
          attachments.push({
            field: 'idDocVerse',
            filename: files.idDocVerse[0].filename,
            patient: patientById
          })
        }
      }
      if (files.cpf) {
        const cpfFound = attachmentSent.find(attch => attch.field === 'cpf')
        if (cpfFound) {
          attachments.push({
            id: cpfFound.id,
            field: cpfFound.field,
            filename: files.cpf[0].filename,
            patient: cpfFound.patient
          })
        } else {
          attachments.push({
            field: 'cpf',
            filename: files.cpf[0].filename,
            patient: patientById
          })
        }
      }
      if (files.addressProof) {
        const addressProofFound = attachmentSent.find(
          attch => attch.field === 'addressProof'
        )
        if (addressProofFound) {
          attachments.push({
            id: addressProofFound.id,
            field: addressProofFound.field,
            filename: files.addressProof[0].filename,
            patient: addressProofFound.patient
          })
        } else {
          attachments.push({
            field: 'addressProof',
            filename: files.addressProof[0].filename,
            patient: patientById
          })
        }
      }
      if (files.medicalReport) {
        const medicalReportFound = attachmentSent.find(
          attch => attch.field === 'medicalReport'
        )
        if (medicalReportFound) {
          attachments.push({
            id: medicalReportFound.id,
            field: medicalReportFound.field,
            filename: files.medicalReport[0].filename,
            patient: medicalReportFound.patient
          })
        } else {
          attachments.push({
            field: 'medicalReport',
            filename: files.medicalReport[0].filename,
            patient: patientById
          })
        }
      }
      if (files.medicalAuthorization) {
        const medicalAuthorizationFound = attachmentSent.find(
          attch => attch.field === 'medicalAuthorization'
        )
        if (medicalAuthorizationFound) {
          attachments.push({
            id: medicalAuthorizationFound.id,
            field: medicalAuthorizationFound.field,
            filename: files.medicalAuthorization[0].filename,
            patient: medicalAuthorizationFound.patient
          })
        } else {
          attachments.push({
            field: 'medicalAuthorization',
            filename: files.medicalAuthorization[0].filename,
            patient: patientById
          })
        }
      }
      if (files.workContract) {
        const workContractFound = attachmentSent.find(
          attch => attch.field === 'workContract'
        )
        if (workContractFound) {
          attachments.push({
            id: workContractFound.id,
            field: workContractFound.field,
            filename: files.workContract[0].filename,
            patient: workContractFound.patient
          })
        } else {
          attachments.push({
            field: 'workContract',
            filename: files.workContract[0].filename,
            patient: patientById
          })
        }
      }
      if (files.prenatalCard) {
        const prenatalCardFound = attachmentSent.find(
          attch => attch.field === 'prenatalCard'
        )
        if (prenatalCardFound) {
          attachments.push({
            id: prenatalCardFound.id,
            field: prenatalCardFound.field,
            filename: files.prenatalCard[0].filename,
            patient: prenatalCardFound.patient
          })
        } else {
          attachments.push({
            field: 'prenatalCard',
            filename: files.prenatalCard[0].filename,
            patient: patientById
          })
        }
      }
      if (files.puerperalCard) {
        const puerperalCardFound = attachmentSent.find(
          attch => attch.field === 'puerperalCard'
        )
        if (puerperalCardFound) {
          attachments.push({
            id: puerperalCardFound.id,
            field: puerperalCardFound.field,
            filename: files.puerperalCard[0].filename,
            patient: puerperalCardFound.patient
          })
        } else {
          attachments.push({
            field: 'puerperalCard',
            filename: files.puerperalCard[0].filename,
            patient: patientById
          })
        }
      }
      if (files.bornAliveDec) {
        const bornAliveDecFound = attachmentSent.find(
          attch => attch.field === 'bornAliveDec'
        )
        if (bornAliveDecFound) {
          attachments.push({
            id: bornAliveDecFound.id,
            field: bornAliveDecFound.field,
            filename: files.bornAliveDec[0].filename,
            patient: bornAliveDecFound.patient
          })
        } else {
          attachments.push({
            field: 'bornAliveDec',
            filename: files.bornAliveDec[0].filename,
            patient: patientById
          })
        }
      }
      if (files.auxDoc) {
        const auxDocFound = attachmentSent.find(
          attch => attch.field === 'auxDoc'
        )
        if (auxDocFound) {
          attachments.push({
            id: auxDocFound.id,
            field: auxDocFound.field,
            filename: files.auxDoc[0].filename,
            patient: auxDocFound.patient
          })
        } else {
          attachments.push({
            field: 'auxDoc',
            filename: files.auxDoc[0].filename,
            patient: patientById
          })
        }
      }

      /** Criando Transação */
      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager.getRepository(Patient).save(patient)
        await transactionalEntityManager
          .getRepository(Attachment)
          .save(attachments)
      })

      return res.json({ msg: 'Atualização efetuada com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async markAsVaccinated (req: Request, res: Response) {
    const { id } = req.params

    try {
      /** Verificando se paciente está aprovado */
      const patientApproved = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select(['patient.id', 'patientStatus.status'])
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .where('patient.id = :id', { id })
        .andWhere('status = :status', { status: 'Aprovado' })
        .getOne()

      if (!patientApproved) {
        return res.status(401).json({
          msg:
            'O cadastro do paciente informado ainda está em análise ou não foi aprovado.'
        })
      }

      const patient = new Patient()
      patient.vaccinated = true

      await getRepository(Patient).update(id, patient)
      return res.json({
        msg: 'Paciente marcado(a) como vacinado(a) com sucesso.'
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async exportMany (req: Request, res: Response) {
    const { type, start, end } = req.query

    let startPlus3 = ''
    let endPlus3 = ''

    if (start && end) {
      const aux1 = addHours(new Date(start as string), 3)
      startPlus3 = format(aux1, `yyyy'-'LL'-'dd HH':'mm':'ss`)

      const aux2 = addHours(new Date(end as string), 3)
      endPlus3 = format(aux2, `yyyy'-'LL'-'dd HH':'mm':'ss`)
    }

    try {
      const queryBuilder = getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patient.phone',
          'patient.createdAt',
          'patientStatus.message',
          'status.status',
          'group'
        ])
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .innerJoin('patient.group', 'group')

      if (start && end) {
        queryBuilder.where('patient.createdAt BETWEEN :start AND :end', {
          start: startPlus3,
          end: endPlus3
        })
      }

      queryBuilder.orderBy('patient.createdAt')

      const patients = await queryBuilder.getMany()

      const patientsParsed = patients.map(patient => {
        const aux = subHours(patient.createdAt as Date, 3)
        const createdAt = format(aux, `dd'/'LL'/'yyyy HH':'mm`)

        const parse = {
          ...patient,
          cpf: masks.cpfMask(patient.cpf as string),
          phone: masks.phoneMask(patient.phone as string),
          status: patient.patientStatus?.status?.status,
          group: patient.group?.group,
          createdAt
        }

        delete parse.patientStatus

        return parse
      })

      let startFormatted = ''
      let endFormatted = ''
      if (start && end) {
        startFormatted = format(new Date(start as string), `dd'/'LL'/'yyyy`)
        endFormatted = format(new Date(end as string), `dd'/'LL'/'yyyy`)
      }

      if (!type) {
        return res.status(400).json({ msg: 'Escolha um formato de saída!' })
      }

      if (type === 'excel') {
        const data = patientsParsed.map(patient => {
          const values = Object.values(patient)

          return values.map(val => String(val))
        })

        const wb = new xl.Workbook()

        const ws = wb.addWorksheet('Lista de Pacientes')

        const headerStyle = wb.createStyle({
          alignment: {
            horizontal: 'center'
          },
          font: {
            color: '#ffffff',
            bold: true
          },
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#093d74'
          }
        })

        ws.cell(1, 1, 1, 7, true)
          .string(
            `Saúde Timon 24h - Lista de Pacientes - Período: ${
              start && end ? `${startFormatted} a ${endFormatted}` : 'Todos'
            }`
          )
          .style(headerStyle)

        ws.cell(2, 1).string('ID').style(headerStyle)
        ws.cell(2, 2).string('Nome').style(headerStyle)
        ws.cell(2, 3).string('CPF').style(headerStyle)
        ws.cell(2, 4).string('Telefone').style(headerStyle)
        ws.cell(2, 5).string('Data do Cadastro').style(headerStyle)
        ws.cell(2, 6).string('Grupo').style(headerStyle)
        ws.cell(2, 7).string('Status').style(headerStyle)

        data.forEach((dt, i) =>
          dt.forEach((cell, j) => ws.cell(i + 3, j + 1).string(cell))
        )

        wb.writeToBuffer().then((buffer: Buffer) => {
          res.contentType(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
          return res.end(buffer)
        })
      }

      if (type === 'pdf') {
        const tBody = patientsParsed.map(patient => {
          const values = Object.values(patient)

          return values.map(val => ({
            text: String(val)
          }))
        })

        const docDefinitions: TDocumentDefinitions = {
          pageMargins: [20, 40, 20, 40],
          defaultStyle: {
            font: 'Roboto'
          },
          content: [
            {
              columns: [
                {
                  image: resolve(
                    __dirname,
                    '..',
                    '..',
                    'images',
                    'logo1024-512.png'
                  ),
                  width: 150,
                  alignment: 'left'
                },
                {
                  text: 'Lista de Pacientes',
                  style: 'header',
                  alignment: 'center',
                  fontSize: 24,
                  bold: true,
                  margin: [0, 25, 120, 0]
                }
              ],
              margin: [0, 0, 0, 8]
            },
            {
              text: `Período: ${
                start && end ? `${startFormatted} a ${endFormatted}` : 'Todos'
              }`,
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 0, 8]
            },
            {
              table: {
                body: [
                  [
                    { text: 'ID', style: 'tHead' },
                    { text: 'Nome', style: 'tHead' },
                    { text: 'CPF', style: 'tHead' },
                    { text: 'Telefone', style: 'tHead' },
                    { text: 'Data do Cadastro', style: 'tHead' },
                    { text: 'Grupo', style: 'tHead' },
                    { text: 'Status', style: 'tHead' }
                  ],
                  ...tBody
                ]
              }
            }
          ],
          styles: {
            tHead: {
              bold: true,
              alignment: 'center',
              fillColor: '#093d74',
              color: '#fff'
            }
          }
        }

        const pdfDoc = pdf(docDefinitions)

        const chunks: Uint8Array[] = []
        pdfDoc.on('data', chunk => chunks.push(chunk))
        pdfDoc.end()
        pdfDoc.on('end', () => {
          const result = Buffer.concat(chunks)
          res.contentType('application/pdf')
          return res.end(result)
        })
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  public async exportSingle (req: Request, res: Response) {
    const { type } = req.query
    const { id } = req.params

    try {
      const patient = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patient.susCard',
          'patient.phone',
          'patient.createdAt',
          'address.street',
          'address.number',
          'address.complement',
          'address.reference',
          'address.neighborhood',
          'attachment.field',
          'attachment.filename',
          'group.group',
          'comorbidityPatient',
          'comorbidity.comorbidity',
          'patientStatus.message',
          'status.status'
        ])
        .innerJoin('patient.group', 'group')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .leftJoin('patient.address', 'address')
        .leftJoin('patient.attachment', 'attachment')
        .leftJoin('patient.comorbidityPatient', 'comorbidityPatient')
        .leftJoin('comorbidityPatient.comorbidity', 'comorbidity')
        .where('patient.id = :id', { id })
        .getOne()

      if (!patient) {
        return res.status(404).json({ msg: 'Paciente não encontrado!' })
      }

      if (!type) {
        return res.status(400).json({ msg: 'Escolha um formato de saída!' })
      }

      const patientParsed = {
        ...patient,
        attachment: patient.attachment?.map(attach => ({
          ...attach,
          filename: `uploads/${attach.filename}`
        }))
      }

      /* if (type === 'pdf') {
      } */

      return res.json(patientParsed)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientController()
