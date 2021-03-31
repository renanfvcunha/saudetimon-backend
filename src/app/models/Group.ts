import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import Patient from './Patient'

@Entity({
  name: 'groups'
})
class Group {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 50
  })
  slug?: string

  @Column({
    length: 150
  })
  group?: string

  @OneToMany(() => Patient, patient => patient.group)
  patient?: Patient[]
}

export default Group
