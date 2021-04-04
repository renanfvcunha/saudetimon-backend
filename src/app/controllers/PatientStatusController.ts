import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import Patient from '../models/Patient'

class PatientStatusController {
  public async index (req: Request, res: Response) {
    try {
      const patientsApproved = await getRepository(Patient)
        .createQueryBuilder('patient')
        .select([
          'patient.id',
          'patient.name',
          'patient.cpf',
          'patientStatus.message',
          'status.id'
        ])
        .leftJoin('patient.patientStatus', 'patientStatus')
        .leftJoin('patientStatus.status', 'status')
        .where('status.id = 2')
        .orderBy('patient.updatedAt')
        .getMany()

      return res.json(patientsApproved)
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientStatusController()
