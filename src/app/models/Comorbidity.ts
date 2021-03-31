import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import ComorbidityPatient from './ComorbidityPatient'

@Entity({
  name: 'comorbidities'
})
class Comorbidity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 100
  })
  comorbidity?: string

  @OneToMany(
    () => ComorbidityPatient,
    comorbidityPatient => comorbidityPatient.comorbidity
  )
  comorbidityPatient?: ComorbidityPatient[]
}

export default Comorbidity
