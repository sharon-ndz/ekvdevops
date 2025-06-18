import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';

export class UsersSeeder1729611205038 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const userFactory = factoryManager.get(User);
    // save 5 factory generated entities, to the database
    await userFactory.saveMany(3);
    // Make a stable test school admin user
    const user = await userFactory.make();
    user.firstName = 'Josiah';
    user.lastName = 'Adgbola';
    user.email = user.firstName.toLowerCase() + '@mailinator.com';
    user.drivingSchoolId = 1;
    // Save stable test school admin user
    await userFactory.save(user);
  }
}
