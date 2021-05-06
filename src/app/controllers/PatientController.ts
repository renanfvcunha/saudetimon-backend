import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
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
    const { per_page, page, idStatus, idGroup, vaccinated } = req.query

    try {
      if (per_page && page) {
        if (idGroup) {
          const totalCount = await getRepository(Patient)
            .createQueryBuilder('patient')
            .select(['patient.id'])
            .innerJoin('patient.patientStatus', 'patientStatus')
            .innerJoin('patientStatus.status', 'status')
            .innerJoin('patient.group', 'group')
            .where('status.id = :idStatus', { idStatus: Number(idStatus) || 1 })
            .andWhere('group.id = :idGroup', { idGroup: Number(idGroup) })
            .andWhere('patient.vaccinated = :vaccinated', {
              vaccinated: vaccinated || false
            })
            .getCount()

          const patients = await getRepository(Patient)
            .createQueryBuilder('patient')
            .select([
              'patient.id',
              'patient.name',
              'patient.cpf',
              'patient.createdAt',
              'patient.updatedAt',
              'group.id'
            ])
            .innerJoin('patient.patientStatus', 'patientStatus')
            .innerJoin('patientStatus.status', 'status')
            .innerJoin('patient.group', 'group')
            .where('status.id = :idStatus', { idStatus: Number(idStatus) || 1 })
            .andWhere('group.id = :idGroup', { idGroup: Number(idGroup) })
            .andWhere('patient.vaccinated = :vaccinated', {
              vaccinated: vaccinated || false
            })
            .take(Number(per_page))
            .skip(Number(per_page) * Number(page))
            .orderBy('patient.createdAt')
            .getMany()

          res.header({
            'Total-Count': totalCount,
            Page: page
          })

          return res.json(patients)
        } else {
          const totalCount = await getRepository(Patient)
            .createQueryBuilder('patient')
            .select('patient.id')
            .innerJoin('patient.patientStatus', 'patientStatus')
            .innerJoin('patientStatus.status', 'status')
            .where('status.id = :idStatus', { idStatus: Number(idStatus) || 1 })
            .andWhere('patient.vaccinated = :vaccinated', {
              vaccinated: vaccinated || false
            })
            .getCount()

          const patients = await getRepository(Patient)
            .createQueryBuilder('patient')
            .select([
              'patient.id',
              'patient.name',
              'patient.cpf',
              'patient.createdAt',
              'patient.updatedAt'
            ])
            .innerJoin('patient.patientStatus', 'patientStatus')
            .innerJoin('patientStatus.status', 'status')
            .where('status.id = :idStatus', { idStatus: Number(idStatus) || 1 })
            .andWhere('patient.vaccinated = :vaccinated', {
              vaccinated: vaccinated || false
            })
            .take(Number(per_page))
            .skip(Number(per_page) * Number(page))
            .orderBy('patient.createdAt')
            .getMany()

          res.header({
            'Total-Count': totalCount,
            Page: page
          })

          return res.json(patients)
        }
      } else {
        const patients = await getRepository(Patient)
          .createQueryBuilder('patient')
          .select([
            'patient.id',
            'patient.name',
            'patient.cpf',
            'patient.createdAt'
          ])
          .getMany()

        return res.json(patients)
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }

  // public async store (req: Request, res: Response) {
  //   const {
  //     name,
  //     cpf,
  //     susCard,
  //     groupSlug,
  //     street,
  //     number,
  //     complement,
  //     reference,
  //     neighborhood,
  //     phone,
  //     idComorbidity
  //   }: IPatient = req.body
  //   const files: IFiles = JSON.parse(JSON.stringify(req.files))

  //   try {
  //     /** Buscando grupo informado no banco de dados */
  //     const group = await getRepository(Group).findOne({
  //       where: { slug: groupSlug }
  //     })

  //     /** Instanciando classes */
  //     const patient = new Patient()
  //     const address = new Address()
  //     const patientStatus = new PatientStatus()
  //     const comorbidityPatient = new ComorbidityPatient()

  //     address.street = street
  //     address.number = number
  //     if (complement) {
  //       address.complement = complement
  //     }
  //     address.reference = reference
  //     address.neighborhood = neighborhood

  //     patientStatus.status = { id: 1 }

  //     if (
  //       (group && group.slug === 'paciente_oncologico') ||
  //       (group && group.slug === 'paciente_renal')
  //     ) {
  //       if (files.medicalReport) {
  //         comorbidityPatient.medicalReport = files.medicalReport[0].filename
  //       }
  //       if (files.medicalAuthorization) {
  //         comorbidityPatient.medicalAuthorization =
  //           files.medicalAuthorization[0].filename
  //       }
  //     }

  //     if (group && group.slug === 'comorbidades') {
  //       comorbidityPatient.comorbidity = { id: idComorbidity }
  //       if (files.medicalReport) {
  //         comorbidityPatient.medicalReport = files.medicalReport[0].filename
  //       }
  //       if (files.medicalPrescription) {
  //         comorbidityPatient.medicalPrescription =
  //           files.medicalPrescription[0].filename
  //       }
  //     }

  //     patient.name = name
  //     patient.cpf = cpf
  //     if (susCard) {
  //       patient.susCard = susCard
  //     }
  //     patient.group = { id: group?.id }
  //     patient.phone = phone
  //     patient.idDocFront = files.idDocFront[0].filename
  //     patient.idDocVerse = files.idDocVerse[0].filename
  //     patient.addressProof = files.addressProof[0].filename
  //     patient.photo = files.photo[0].filename
  //     patient.address = address
  //     patient.patientStatus = patientStatus
  //     if (
  //       group &&
  //       ['paciente_oncologico', 'paciente_renal', 'comorbidades'].find(
  //         grp => grp === group.slug
  //       )
  //     ) {
  //       patient.comorbidityPatient = comorbidityPatient
  //     }

  //     await getRepository(Patient).save(patient)

  //     return res.json({ msg: 'Cadastro efetuado com sucesso!' })
  //   } catch (err) {
  //     console.error(err)
  //     return res.status(500).json({
  //       msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
  //     })
  //   }
  // }

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

      if (renOncImun) {
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
          'patient.idDocFront',
          'patient.idDocVerse',
          'patient.addressProof',
          'patient.photo',
          'patient.createdAt',
          'group.slug',
          'group.group',
          'address.street',
          'address.number',
          'address.complement',
          'address.reference',
          'address.neighborhood',
          'comorbidityPatient',
          'patientStatus.message',
          'status.id',
          'status.status'
        ])
        .leftJoin('patient.group', 'group')
        .leftJoin('patient.address', 'address')
        .leftJoin('patient.comorbidityPatient', 'comorbidityPatient')
        .leftJoin('patient.patientStatus', 'patientStatus')
        .leftJoin('patientStatus.status', 'status')
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
          'comorbidityPatient.idComorbidity'
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
          'group.id',
          'group.slug',
          'group.group',
          'patientStatus.message',
          'patientStatus.status',
          'status.id',
          'status.status',
          'status.message'
        ])
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
        .innerJoin('patient.group', 'group')
        .innerJoin('patient.patientStatus', 'patientStatus')
        .innerJoin('patientStatus.status', 'status')
        .where('group.id = :groupId', { groupId: patient.group?.id })
        .andWhere('status.id = 2')
        .andWhere('patient.vaccinated = false')
        .orderBy('patient.updatedAt')
        .getMany()

      if (
        patient.patientStatus?.status &&
        patient.patientStatus?.status.id === 2
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

  // public async update (req: Request, res: Response) {
  //   const { id } = req.params
  //   const {
  //     name,
  //     cpf,
  //     susCard,
  //     street,
  //     number,
  //     complement,
  //     reference,
  //     neighborhood,
  //     phone,
  //     idComorbidity
  //   }: IPatient = req.body
  //   const files: IFiles = JSON.parse(JSON.stringify(req.files))

  //   try {
  //     /** Buscando grupo no banco de dados */
  //     const group = await getRepository(Group)
  //       .createQueryBuilder('group')
  //       .select('group.slug')
  //       .innerJoin('group.patient', 'patient')
  //       .where('patient.id = :id', { id })
  //       .getOne()

  //     /** Instanciando classes */
  //     const patient = new Patient()
  //     const address = new Address()
  //     const patientStatus = new PatientStatus()
  //     const comorbidityPatient = new ComorbidityPatient()

  //     address.street = street
  //     address.number = number
  //     if (complement) {
  //       address.complement = complement
  //     }
  //     address.reference = reference
  //     address.neighborhood = neighborhood

  //     patientStatus.status = { id: 1 }

  //     if (
  //       (group && group.slug === 'paciente_oncologico') ||
  //       (group && group.slug === 'paciente_renal')
  //     ) {
  //       if (files.medicalReport) {
  //         comorbidityPatient.medicalReport = files.medicalReport[0].filename
  //       }
  //       if (files.medicalAuthorization) {
  //         comorbidityPatient.medicalAuthorization =
  //           files.medicalAuthorization[0].filename
  //       }
  //     }

  //     if (group && group.slug === 'comorbidades') {
  //       comorbidityPatient.comorbidity = { id: idComorbidity }
  //       if (files.medicalReport) {
  //         comorbidityPatient.medicalReport = files.medicalReport[0].filename
  //       }
  //       if (files.medicalPrescription) {
  //         comorbidityPatient.medicalPrescription =
  //           files.medicalPrescription[0].filename
  //       }
  //     }

  //     patient.id = Number(id)
  //     patient.name = name
  //     patient.cpf = cpf
  //     if (susCard) {
  //       patient.susCard = susCard
  //     }
  //     patient.group = { id: group?.id }
  //     patient.phone = phone
  //     if (files.idDocFront) {
  //       patient.idDocFront = files.idDocFront[0].filename
  //     }
  //     if (files.idDocVerse) {
  //       patient.idDocVerse = files.idDocVerse[0].filename
  //     }
  //     if (files.addressProof) {
  //       patient.addressProof = files.addressProof[0].filename
  //     }
  //     if (files.photo) {
  //       patient.photo = files.photo[0].filename
  //     }
  //     patient.address = address
  //     patient.patientStatus = patientStatus
  //     if (
  //       group &&
  //       ['paciente_oncologico', 'paciente_renal', 'comorbidades'].find(
  //         grp => grp === group.slug
  //       )
  //     ) {
  //       patient.comorbidityPatient = comorbidityPatient
  //     }

  //     await getRepository(Patient).save(patient)

  //     return res.json({ msg: 'Atualização efetuada com sucesso!' })
  //   } catch (err) {
  //     console.error(err)
  //     return res.status(500).json({
  //       msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
  //     })
  //   }
  // }

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
