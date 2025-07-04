import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { Status } from '../../core/constants/enums';
import { generateDrivingSchoolId } from '../../core/helpers/general';

export class DrivingSchoolSeeder1656470930860 implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const drivingSchoolFactory = factoryManager.get(DrivingSchool);
    const drivingSchool = await drivingSchoolFactory.make();
    drivingSchool.name = 'Dominion Driving School';
    drivingSchool.phone = '09000000011';
    drivingSchool.email = 'dominion.school@mailinator.com';
    drivingSchool.address = '86176 Noel Streets, Lagos-Mainland, Lagos State, 23407, Nigeria';
    drivingSchool.stateId = 25;
    drivingSchool.lgaId = 518;
    drivingSchool.identifier = await generateDrivingSchoolId();
    drivingSchool.rcNumber = 'RC6464848';
    drivingSchool.totalVehicles = 10;
    drivingSchool.totalSimulators = 4;
    drivingSchool.totalClassrooms = 10;
    drivingSchool.classRoomCapacity = '200';
    drivingSchool.totalInstructors = 7;
    drivingSchool.status = Status.Active;
    drivingSchool.inspectionDate = new Date();
    await drivingSchoolFactory.save(drivingSchool);
  }
}
