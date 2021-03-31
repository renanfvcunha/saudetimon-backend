import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity({
  name: 'frequent_doubts'
})
class FrequentDoubt {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 191
  })
  question?: string

  @Column('text')
  answer?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

export default FrequentDoubt
