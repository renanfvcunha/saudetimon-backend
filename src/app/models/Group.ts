import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import Category from './Category'
import Patient from './Patient'

@Entity({
  name: 'groups'
})
class Group {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 191
  })
  group?: string

  @OneToMany(() => Patient, patient => patient.group)
  patient?: Patient[]

  @ManyToOne(() => Category, category => category.group, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'idCategory'
  })
  category?: Category
}

export default Group
