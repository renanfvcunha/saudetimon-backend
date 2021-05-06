import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import Patient from './Patient'
import Comorbidity from './Comorbidity'

@Entity({
  name: 'comorbidity_patients'
})
class ComorbidityPatient {
  @OneToOne(() => Patient, patient => patient.comorbidityPatient, {
    primary: true,
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
    default: false
  })
  renOncImun?: boolean
}

export default ComorbidityPatient
