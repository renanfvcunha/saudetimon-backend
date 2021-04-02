import { Express, Request, Response } from 'express'
import { getRepository } from 'typeorm'

import IPatient from '../../typescript/IPatient'
import Group from '../models/Group'
import Patient from '../models/Patient'

class PatientController {
  public async store (req: Request, res: Response) {
    const {
      cpf,
      susCard,
      idGroup,
      street,
      number,
      complement,
      reference,
      neighborhood,
      phone
    }: IPatient = req.body
    const files: Express.Multer.File[] = JSON.parse(JSON.stringify(req.files))

    try {
      /** Buscando grupo informado no banco de dados e verificando se existe */
      const group = await getRepository(Group).findOne(idGroup)

      if (!group) {
        return res
          .status(400)
          .json({ msg: 'O grupo informado não foi encontrado.' })
      }

      /** Cadastrando paciente */
      const patient = new Patient()
      patient.cpf = cpf
      patient.susCard = susCard
      patient.group = { id: idGroup }
      patient.phone = phone
      patient.idDocFront = files[0].filename
      patient.idDocVerse = files[1].filename
      patient.addressProof = files[2].filename
      patient.photo = files[3].filename
      patient.address.street = street
      patient.address.number = number
      patient.address.complement = complement
      patient.address.reference = reference
      patient.address.neighborhood = neighborhood
      patient.patientStatus.status = { id: 1 }

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
