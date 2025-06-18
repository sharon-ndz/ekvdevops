import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CbtCenter } from '../../entities/cbt-center.entity';

export class CbtCentersSeeder1737353011881 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const cbtCenterFactory = factoryManager.get(CbtCenter);
    // save 1 factory generated entity, to the database
    await cbtCenterFactory.saveMany(2);
  }
}
