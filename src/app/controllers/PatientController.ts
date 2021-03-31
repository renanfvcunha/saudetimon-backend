import { Request, Response } from 'express'

class PatientController {
  public async store (req: Request, res: Response) {
    const { cpf, susCard, idGroup, phone } = req.body
    const files = req.files

    try {
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        msg: 'Erro interno do servidor. Tente novamente ou contate o suporte.'
      })
    }
  }
}

export default new PatientController()
