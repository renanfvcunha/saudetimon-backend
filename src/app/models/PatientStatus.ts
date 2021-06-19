import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  UpdateDateColumn
} from 'typeorm'

import Patient from './Patient'
import Status from './Status'

@Entity({
  name: 'patients_status'
})
class PatientStatus {
  @OneToOne(() => Patient, patient => patient.patientStatus, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'idPatient'
  })
  patient?: Patient

  @Column('text', {
    nullable: true
  })
  message?: string | null

  @ManyToOne(() => Status, status => status.patientStatus, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  status?: Status | null

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

export default PatientStatus
