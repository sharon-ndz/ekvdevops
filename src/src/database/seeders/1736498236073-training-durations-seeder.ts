import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { TrainingDuration } from '../../entities/training-duration.entity';
import { Status } from '../../core/constants/enums';

export class TrainingDurationsSeeder1736498236073 implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const schoolIds: number[] = [1];
    const trainingDurationRepository = dataSource.getRepository(TrainingDuration);
    const durations: any = [
      { duration: 3, durationText: '3 Months', isActive: Status.Active },
      { duration: 6, durationText: '6 Months', isActive: Status.Active },
      { duration: 9, durationText: '9 Months', isActive: Status.Active },
    ];

    for (let i = 0; i < schoolIds.length; i++) {
      const schoolId = schoolIds[i];

      for (const duration of durations) {
        duration.drivingSchoolId = schoolId;
        await trainingDurationRepository.insert(duration);
      }
    }
  }
}
