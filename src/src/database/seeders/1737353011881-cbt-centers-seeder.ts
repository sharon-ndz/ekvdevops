import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CbtCenter } from '../../entities/cbt-center.entity';
import { Status } from '../../core/constants/enums';

export class CbtCentersSeeder1737353011881 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const cbtCenterFactory = factoryManager.get(CbtCenter);
    const cbtCenter = await cbtCenterFactory.make();
    cbtCenter.name = 'Dominion CBT Center';
    cbtCenter.phone = '09000000022';
    cbtCenter.email = 'dominion.cbt@mailinator.com';
    cbtCenter.lgaId = 518;
    cbtCenter.stateId = 25;
    cbtCenter.isActive = Status.Active;
    await cbtCenterFactory.save(cbtCenter);
  }
}
