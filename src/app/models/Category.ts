import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Group from './Group'

import Patient from './Patient'

@Entity({
  name: 'categories'
})
class Category {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 150
  })
  category?: string

  @OneToMany(() => Patient, patient => patient.category)
  patient?: Patient[]

  @OneToMany(() => Group, group => group.category)
  group?: Group[]
}

export default Category
