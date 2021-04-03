export default interface IPatient {
  id?: number
  name: string
  cpf: string
  susCard?: string
  idGroup: number
  idComorbidity?: number
  street: string
  number: number
  reference: string
  complement?: string
  neighborhood: string
  phone: string
}
