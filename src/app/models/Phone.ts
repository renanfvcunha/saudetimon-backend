import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity({
  name: 'phones'
})
class Phone {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 100
  })
  name?: string

  @Column({
    length: 50
  })
  phone?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}

export default Phone
