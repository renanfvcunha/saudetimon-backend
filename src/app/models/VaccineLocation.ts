import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity({
  name: 'vaccine_locations'
})
class VaccineLocation {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    length: 100
  })
  name?: string

  @Column({
    length: 190
  })
  helperText?: string

  @Column({
    length: 150
  })
  picture?: string

  @Column({
    length: 200
  })
  url?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}

export default VaccineLocation
