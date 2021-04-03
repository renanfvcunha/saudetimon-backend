import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import IFiles from '../../typescript/IFiles'

import IPatient from '../../typescript/IPatient'
import Group from '../models/Group'
import Patient from '../models/Patient'

class PatientController {
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
      patient.name = name
      patient.cpf = cpf
      patient.susCard = susCard
      patient.group = { id: idGroup }
      patient.phone = phone
      patient.idDocFront = files.idDocFront[0].filename
      patient.idDocVerse = files.idDocVerse[0].filename
      patient.addressProof = files.addressProof[0].filename
      patient.photo = files.photo[0].filename
      patient.address.street = street
      patient.address.number = number
      patient.address.complement = complement
      patient.address.reference = reference
      patient.address.neighborhood = neighborhood
      patient.patientStatus.status = { id: 1 }

      if (
        (group && group.slug === 'paciente_oncologico') ||
        (group && group.slug === 'paciente_renal')
      ) {
        if (files.medicalReport) {
          patient.comorbidityPatient.medicalReport =
            files.medicalReport[0].filename
        }
        if (files.medicalAuthorization) {
          patient.comorbidityPatient.medicalAuthorization =
            files.medicalAuthorization[0].filename
        }
      }

      if (group && group.slug === 'comorbidades') {
        patient.comorbidityPatient.comorbidity = { id: idComorbidity }
        if (files.medicalReport) {
          patient.comorbidityPatient.medicalReport =
            files.medicalReport[0].filename
        }
        if (files.medicalPrescription) {
          patient.comorbidityPatient.medicalPrescription =
            files.medicalPrescription[0].filename
        }
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
}

export default new PatientController()
