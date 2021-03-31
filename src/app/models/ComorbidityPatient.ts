import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import Patient from './Patient'
import Comorbidity from './Comorbidity'

@Entity({
  name: 'comorbidity_patients'
})
class ComorbidityPatient {
  @OneToOne(() => Patient, patient => patient.comorbidityPatient, {
    primary: true,
    cascade: ['insert', 'soft-remove'],
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'idPatient'
  })
  patient?: Patient

  @ManyToOne(() => Comorbidity, comorbidity => comorbidity.comorbidityPatient, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  @JoinColumn({
    name: 'idComorbidity'
  })
  comorbidity?: Comorbidity | null

  @Column({
    length: 100,
    nullable: true
  })
  medicalReport?: string

  @Column({
    length: 100,
    nullable: true
  })
  medicalAuthorization?: string

  @Column({
    length: 100,
    nullable: true
  })
  medicalPrescription?: string
}

export default ComorbidityPatient
