import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Status } from '../../core/constants/enums';
import { RoleName } from '../../middlewares/roles';

export class UsersSeeder1729611205038 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const userFactory = factoryManager.get(User);
    // Make a stable test super administrator user
    const superAdminRoleId = 2;
    const superAdminRoleName = RoleName(superAdminRoleId);
    const superAdminUser = await userFactory.make();
    superAdminUser.firstName = 'Super';
    superAdminUser.lastName = 'Admin';
    superAdminUser.phone = '09000000001';
    superAdminUser.email = 'super.admin@mailinator.com';
    superAdminUser.roleId = superAdminRoleId;
    superAdminUser.roleName = superAdminRoleName;
    superAdminUser.stateId = 25;
    superAdminUser.lgaId = 518; // Lagos MainLand by default
    superAdminUser.isActive = Status.Active;
    superAdminUser.password = 'password';
    // Save stable test school admin user
    await userFactory.save(superAdminUser);

    // Create default LASDRI Officer
    const lasdriRoleId = 6;
    const lasdriRoleName = RoleName(lasdriRoleId);
    const lasdriOfficer = await userFactory.make();
    lasdriOfficer.firstName = 'Lasdri';
    lasdriOfficer.lastName = 'Officer';
    lasdriOfficer.phone = '09000000002';
    lasdriOfficer.email = 'lasdri.officer@mailinator.com';
    lasdriOfficer.roleId = lasdriRoleId;
    lasdriOfficer.roleName = lasdriRoleName;
    lasdriOfficer.stateId = 25;
    lasdriOfficer.lgaId = 518; // Lagos MainLand by default
    lasdriOfficer.isActive = Status.Active;
    lasdriOfficer.password = 'password';
    // Save stable test school admin user
    await userFactory.save(lasdriOfficer);

    // Make a stable test school admin user
    const schoolAdminRoleId = 3;
    const schoolAdminRoleName = RoleName(schoolAdminRoleId);
    const schoolAdminUser = await userFactory.make();
    schoolAdminUser.firstName = 'Josiah';
    schoolAdminUser.lastName = 'Adgbola';
    schoolAdminUser.phone = '09000000002';
    schoolAdminUser.email =
      schoolAdminUser.firstName.toLowerCase() +
      '.' +
      schoolAdminUser.lastName.toLowerCase() +
      '@mailinator.com';
    schoolAdminUser.drivingSchoolId = 1; // the first seeded driving school
    schoolAdminUser.roleId = schoolAdminRoleId;
    schoolAdminUser.roleName = schoolAdminRoleName;
    schoolAdminUser.stateId = 25;
    schoolAdminUser.lgaId = 518; // Lagos MainLand by default
    schoolAdminUser.isActive = Status.Active;
    schoolAdminUser.password = 'password';
    // Save stable test school admin user
    await userFactory.save(schoolAdminUser);
  }
}
