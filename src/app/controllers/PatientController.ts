import { Request, Response } from 'express'
import { getManager, getRepository } from 'typeorm'
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
      if (files.patientContract) {
        attachments.push({
          field: 'patientContract',
          filename: files.patientContract[0].filename
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
          'group.group',
          'comorbidityPatient',
          'comorbidity.comorbidity',
          'patientStatus.message',
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
          'comorbidity.id as "idComorbidity"'
        ])
        .innerJoin('patient.address', 'address')
        .leftJoin('patient.comorbidityPatient', 'comorbidityPatient')
        .leftJoin('comorbidityPatient.comorbidity', 'comorbidity')
        .where('patient.cpf = :cpf', { cpf })
        .getRawOne()

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
      if (files.patientContract) {
        const patientContractFound = attachmentSent.find(
          attch => attch.field === 'patientContract'
        )
        if (patientContractFound) {
          attachments.push({
            id: patientContractFound.id,
            field: patientContractFound.field,
            filename: files.patientContract[0].filename,
            patient: patientContractFound.patient
          })
        } else {
          attachments.push({
            field: 'patientContract',
            filename: files.patientContract[0].filename,
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
        .where('patient.id = :id', { id })
        .andWhere('patientStatus.status = 2')
        .getRawOne()

      if (!patientApproved) {
        return res.status(401).json({
          msg:
            'O cadastro do paciente informado ainda está em análise ou não foi aprovado.'
        })
      }

      const patient = new Patient()
      patient.vaccinated = true

      await getRepository(Patient).update(id, patient)
      return res.json({ msg: 'Usuário marcado como vacinado com sucesso.' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientController()
