export default interface IPatient {
  id?: number
  name: string
  cpf: string
  susCard?: string
  phone: string
  street: string
  number: number
  reference: string
  complement?: string
  neighborhood: string
  idCategory: number
  idGroup: number
  idComorbidity?: number
  renOncImun: string
}
