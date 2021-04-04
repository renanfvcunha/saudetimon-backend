import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import PatientStatus from './PatientStatus'

@Entity({
  name: 'status'
})
class Status {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 15
  })
  status?: string

  @Column('text')
  message?: string

  @OneToMany(() => PatientStatus, patientStatus => patientStatus.status, {
    cascade: true
  })
  patientStatus?: PatientStatus[]
}

export default Status
