import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

import Category from '../../app/models/Category'
import Group from '../../app/models/Group'
import { BedRiddenSeed } from '../seeds/bedridden.seed'
import { LeftOverSeed } from '../seeds/leftover.seed'
import { RegistrationSeed } from '../seeds/registration.seed'

export class SeedGroup1620243113459 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    try {
      const bedriddenCategory = await getRepository(Category).findOne({
        where: { category: 'Pacientes Acamados' }
      })

      const leftOverCategory = await getRepository(Category).findOne({
        where: { category: 'Sobra de Doses' }
      })

      const registrationCategory = await getRepository(Category).findOne({
        where: { category: 'Cadastro' }
      })

      if (bedriddenCategory) {
        const Bedridden = BedRiddenSeed.map(bedridden => ({
          ...bedridden,
          category: bedriddenCategory
        }))

        await getRepository(Group).save(Bedridden)
      }

      if (leftOverCategory) {
        const LeftOver = LeftOverSeed.map(leftover => ({
          ...leftover,
          category: leftOverCategory
        }))

        await getRepository(Group).save(LeftOver)
      }

      if (registrationCategory) {
        const Registration = RegistrationSeed.map(registration => ({
          ...registration,
          category: registrationCategory
        }))

        await getRepository(Group).save(Registration)
      }
    } catch (err) {
      console.error(err)
    }
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Group).delete({})
    } catch (err) {
      console.error(err)
    }
  }
}
