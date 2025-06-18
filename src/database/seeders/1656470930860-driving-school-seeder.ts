import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DrivingSchool } from '../../entities/driving-school.entity';

export class DrivingSchoolSeeder1656470930860 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const drivingFactory = factoryManager.get(DrivingSchool);
    // save 1 factory generated entity, to the database
    await drivingFactory.saveMany(2);
  }
}
