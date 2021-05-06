import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Category from './Category'
import Address from './Address'
import ComorbidityPatient from './ComorbidityPatient'
import PatientStatus from './PatientStatus'
import Group from './Group'
import Attachment from './Attachment'

@Entity({
  name: 'patients'
})
class Patient {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 100
  })
  name?: string

  @Column({
    length: 15,
    unique: true
  })
  cpf?: string

  @Column({
    length: 20,
    unique: true,
    nullable: true
  })
  susCard?: string

  @Column({
    length: 15
  })
  phone?: string

  @Column({
    default: false
  })
  vaccinated?: boolean

  @OneToOne(() => Address, address => address.patient, {
    cascade: true
  })
  address?: Address

  @OneToOne(
    () => ComorbidityPatient,
    comorbidityPatient => comorbidityPatient.patient,
    {
      cascade: true
    }
  )
  comorbidityPatient?: ComorbidityPatient

  @OneToOne(() => PatientStatus, patientStatus => patientStatus.patient, {
    cascade: true
  })
  patientStatus?: PatientStatus

  @ManyToOne(() => Category, category => category.patient, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    cascade: true
  })
  @JoinColumn({
    name: 'idCategory'
  })
  category?: Category | null

  @ManyToOne(() => Group, group => group.category, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    cascade: true
  })
  @JoinColumn({
    name: 'idGroup'
  })
  group?: Group | null

  @OneToMany(() => Attachment, attachment => attachment.patient, {
    cascade: true
  })
  attachment?: Attachment[]

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

export default Patient
