import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

import Comorbidity from '../../app/models/Comorbidity'
import { ComorbiditySeed } from '../seeds/comorbidity.seed'

export class SeedComorbidity1617217446282 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Comorbidity).save(ComorbiditySeed)
    } catch (err) {
      console.error(err)
    }
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    try {
      await getRepository(Comorbidity).delete({})
    } catch (err) {
      console.error(err)
    }
  }
}
