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
  public constructor () {
    this.address = new Address()
    this.patientStatus = new PatientStatus()
  }

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
    length: 15
  })
  phone?: string

  @Column({
    default: false
  })
  attended?: boolean

  @Column({
    length: 100
  })
  idDocFront?: string

  @Column({
    length: 100
  })
  idDocVerse?: string

  @Column({
    length: 100
  })
  addressProof?: string

  @Column({
    length: 100
  })
  photo?: string

  @OneToOne(() => Address, address => address.patient, {
    cascade: ['insert', 'soft-remove']
  })
  address: Address

  @OneToOne(
    () => ComorbidityPatient,
    comorbidityPatient => comorbidityPatient.patient,
    {
      cascade: ['insert', 'soft-remove']
    }
  )
  comorbidityPatient?: ComorbidityPatient

  @OneToOne(() => PatientStatus, patientStatus => patientStatus.patient, {
    cascade: ['insert', 'soft-remove']
  })
  patientStatus: PatientStatus

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
