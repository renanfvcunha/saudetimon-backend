import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

import Group from '../../app/models/Group'
import { GroupSeed } from '../seeds/group.seed'

export class SeedGroup1617213598196 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Group).save(GroupSeed)
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
