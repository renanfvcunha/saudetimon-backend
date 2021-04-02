import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

import Status from '../../app/models/Status'
import { StatusSeed } from '../seeds/status.seed'

export class SeedStatus1617320950449 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Status).save(StatusSeed)
    } catch (err) {
      console.error(err)
    }
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Status).delete({})
    } catch (err) {
      console.error(err)
    }
  }
}
