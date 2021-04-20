import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import IFiles from '../../typescript/IFiles'

import IPatient from '../../typescript/IPatient'
import IPatientStatus from '../../typescript/IPatientStatus'
import Address from '../models/Address'
import ComorbidityPatient from '../models/ComorbidityPatient'
import Group from '../models/Group'
import Patient from '../models/Patient'
import PatientStatus from '../models/PatientStatus'

class PatientController {
  public async index (req: Request, res: Response) {
    const { per_page, page, idStatus, idGroup } = req.query

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
            .take(Number(per_page))
            .skip(Number(per_page) * Number(page))
            .orderBy('patient.updatedAt')
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
            .take(Number(per_page))
            .skip(Number(per_page) * Number(page))
            .orderBy('patient.updatedAt')
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

  public async store (req: Request, res: Response) {
    const {
      name,
      cpf,
      susCard,
      groupSlug,
      street,
      number,
      complement,
      reference,
      neighborhood,
      phone,
      idComorbidity
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    try {
      /** Buscando grupo informado no banco de dados */
      const group = await getRepository(Group).findOne({
        where: { slug: groupSlug }
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

      patientStatus.status = { id: 1 }

      if (
        (group && group.slug === 'paciente_oncologico') ||
        (group && group.slug === 'paciente_renal')
      ) {
        if (files.medicalReport) {
          comorbidityPatient.medicalReport = files.medicalReport[0].filename
        }
        if (files.medicalAuthorization) {
          comorbidityPatient.medicalAuthorization =
            files.medicalAuthorization[0].filename
        }
      }

      if (group && group.slug === 'comorbidades') {
        comorbidityPatient.comorbidity = { id: idComorbidity }
        if (files.medicalReport) {
          comorbidityPatient.medicalReport = files.medicalReport[0].filename
        }
        if (files.medicalPrescription) {
          comorbidityPatient.medicalPrescription =
            files.medicalPrescription[0].filename
        }
      }

      patient.name = name
      patient.cpf = cpf
      if (susCard) {
        patient.susCard = susCard
      }
      patient.group = { id: group?.id }
      patient.phone = phone
      patient.idDocFront = files.idDocFront[0].filename
      patient.idDocVerse = files.idDocVerse[0].filename
      patient.addressProof = files.addressProof[0].filename
      patient.photo = files.photo[0].filename
      patient.address = address
      patient.patientStatus = patientStatus
      if (
        group &&
        ['paciente_oncologico', 'paciente_renal', 'comorbidades'].find(
          grp => grp === group.slug
        )
      ) {
        patient.comorbidityPatient = comorbidityPatient
      }

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

  public async getStatus (req: Request, res: Response) {
    const { cpf } = req.params

    try {
      const patient = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.cpf',
          'group.id',
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

  public async checkUpdatable (req: Request, res: Response) {
    const { cpf } = req.params

    try {
      const patientUpdatable = await getRepository(Patient).findOne({
        where: { cpf, updatable: true }
      })

      if (!patientUpdatable) {
        return res.status(401).json({
          msg:
            'Seu cadastro ainda está em análise ou já foi aprovado, portanto não é possível editá-lo.'
        })
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }

    return res.json()
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
      patient.attended = true
      if (idStatus === 3) {
        patient.updatable = true
      }
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
      groupSlug,
      street,
      number,
      complement,
      reference,
      neighborhood,
      phone,
      idComorbidity
    }: IPatient = req.body
    const files: IFiles = JSON.parse(JSON.stringify(req.files))

    try {
      const patientUpdatable = await getRepository(Patient).findOne({
        where: { cpf, updatable: true }
      })

      if (!patientUpdatable) {
        return res.status(401).json({
          msg: 'Paciente não atualizável.'
        })
      }

      /** Buscando grupo informado no banco de dados */
      const group = await getRepository(Group).findOne({
        where: { slug: groupSlug }
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

      patientStatus.status = { id: 1 }

      if (
        (group && group.slug === 'paciente_oncologico') ||
        (group && group.slug === 'paciente_renal')
      ) {
        if (files.medicalReport) {
          comorbidityPatient.medicalReport = files.medicalReport[0].filename
        }
        if (files.medicalAuthorization) {
          comorbidityPatient.medicalAuthorization =
            files.medicalAuthorization[0].filename
        }
      }

      if (group && group.slug === 'comorbidades') {
        comorbidityPatient.comorbidity = { id: idComorbidity }
        if (files.medicalReport) {
          comorbidityPatient.medicalReport = files.medicalReport[0].filename
        }
        if (files.medicalPrescription) {
          comorbidityPatient.medicalPrescription =
            files.medicalPrescription[0].filename
        }
      }

      patient.id = Number(id)
      patient.name = name
      patient.cpf = cpf
      if (susCard) {
        patient.susCard = susCard
      }
      patient.group = { id: group?.id }
      patient.phone = phone
      patient.idDocFront = files.idDocFront[0].filename
      patient.idDocVerse = files.idDocVerse[0].filename
      patient.addressProof = files.addressProof[0].filename
      patient.photo = files.photo[0].filename
      patient.attended = false
      patient.updatable = false
      patient.address = address
      patient.patientStatus = patientStatus
      if (
        group &&
        ['paciente_oncologico', 'paciente_renal', 'comorbidades'].find(
          grp => grp === group.slug
        )
      ) {
        patient.comorbidityPatient = comorbidityPatient
      }

      await getRepository(Patient).save(patient)

      return res.json({ msg: 'Atualização efetuada com sucesso!' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientController()
