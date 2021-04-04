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
    try {
      const patients = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patient.createdAt'
        ])
        .where('patient.attended = false')
        .orderBy('patient.updatedAt')
        .getMany()

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
      idGroup,
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
      const group = await getRepository(Group).findOne(idGroup)

      /** Cadastrando paciente */
      const patient = new Patient()
      const address = new Address()
      const patientStatus = new PatientStatus()
      const comorbidityPatient = new ComorbidityPatient()

      address.street = street
      address.number = number
      address.complement = complement
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
      patient.susCard = susCard
      patient.group = { id: idGroup }
      patient.phone = phone
      patient.idDocFront = files.idDocFront[0].filename
      patient.idDocVerse = files.idDocVerse[0].filename
      patient.addressProof = files.addressProof[0].filename
      patient.photo = files.photo[0].filename
      patient.address = address
      patient.patientStatus = patientStatus
      patient.comorbidityPatient = comorbidityPatient

      await getRepository(Patient).save(patient)

      return res.json({ msg: 'Cadastro efetuado com sucesso!' })
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
      const response = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.cpf',
          'patientStatus.message',
          'patientStatus.status',
          'status.id',
          'status.message'
        ])
        .leftJoin('patient.patientStatus', 'patientStatus')
        .leftJoin('patientStatus.status', 'status')
        .where('patient.cpf = :cpf', { cpf })
        .getOne()

      return res.json(response)
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
      patient.attended = true
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
}

export default new PatientController()
