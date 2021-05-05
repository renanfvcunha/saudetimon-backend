import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

import Category from '../../app/models/Category'
import { CategorySeed } from '../seeds/category.seed'

export class SeedGroup1617213598196 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Category).save(CategorySeed)
    } catch (err) {
      console.error(err)
    }
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Category).delete({})
    } catch (err) {
      console.error(err)
    }
  }
}
