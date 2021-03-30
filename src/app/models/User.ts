import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity({
  name: 'users'
})
class Usuario {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 150
  })
  name?: string

  @Column({
    length: 100,
    unique: true
  })
  username?: string

  @Column()
  admin?: boolean

  @Column()
  password?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

export default Usuario
