import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import Patient from './Patient'

@Entity({
  name: 'attachments'
})
class Attachment {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 50
  })
  field?: string

  @Column({
    length: 100
  })
  filename?: string

  @ManyToOne(() => Patient, patient => patient.attachment, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'idPatient'
  })
  patient?: Patient
}

export default Attachment
