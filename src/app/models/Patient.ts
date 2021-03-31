import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Group from './Group'
import Address from './Address'
import ComorbidityPatient from './ComorbidityPatient'
import PatientStatus from './PatientStatus'

@Entity({
  name: 'patients'
})
class Patient {
  @PrimaryGeneratedColumn()
  id?: number

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
    length: 100
  })
  addressProof?: string

  @Column()
  phone?: number

  @Column({
    length: 100
  })
  photo?: string

  @Column()
  attended?: boolean

  @OneToOne(() => Address, address => address.patient)
  address?: Address

  @OneToOne(
    () => ComorbidityPatient,
    comorbidityPatient => comorbidityPatient.patient
  )
  comorbidityPatient?: ComorbidityPatient

  @OneToOne(() => PatientStatus, patientStatus => patientStatus.patient)
  patientStatus?: PatientStatus

  @ManyToOne(() => Group, group => group.patient, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  @JoinColumn({
    name: 'idGroup'
  })
  group?: Group | null

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

export default Patient
