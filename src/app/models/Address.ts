import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import Patient from './Patient'

@Entity({
  name: 'addresses'
})
class Address {
  @OneToOne(() => Patient, patient => patient.address, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'idPatient'
  })
  patient?: Patient

  @Column({
    length: 100
  })
  street?: string

  @Column()
  number?: number

  @Column({
    nullable: true,
    length: 150
  })
  complement?: string

  @Column({
    length: 150
  })
  reference?: string

  @Column({
    length: 100
  })
  neighborhood?: string
}

export default Address
