import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { InspectionQuestion } from '../../entities/inspection-question.entity';
import { InpectionQuestionCategory } from '../../core/constants/enums';
import { User } from '../../entities/user.entity';
import { Role } from '../../middlewares/roles';

export class InspectionTestSeederSeeder1748516014603 implements Seeder {
  track = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const inspectionQuestionRepository = dataSource.getRepository(InspectionQuestion);
    const userRepository = dataSource.getRepository(User);

    let adminUser = await userRepository.findOne({ where: { roleId: Role.LASDRI_ADMIN } });
    if (!adminUser) {
      // find any admin
      adminUser = await userRepository.findOne({ where: { roleId: Role.Admin } });
    }

    const inspectionQuestionsData = {
      questions: [
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.LicenseAndAccreditation,
          question: 'Does driving school have licensed instructors with valid certifications?',
          correctAnswer: 'A. Yes',
          id: 1,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.FacilitiesAndEquipment,
          question: 'Driving School has a classroom for theoretical lessons',
          correctAnswer: 'A. Yes',
          id: 2,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.FacilitiesAndEquipment,
          question: 'Driving School has an administrative office for records & operations',
          correctAnswer: 'A. Yes',
          id: 3,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.VehicleAndDrivingRange,
          question: 'Driving School provides a course manual for students',
          correctAnswer: 'A. Yes',
          id: 4,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.VehicleAndDrivingRange,
          question: 'Driving School has copies of the Highway Code for studies',
          correctAnswer: 'A. Yes',
          id: 5,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.LearningMaterials,
          question: 'Driving School provides a course manual for students',
          correctAnswer: 'A. Yes',
          id: 6,
        },
        {
          options: [
            { label: 'A. Yes', marks: 2 },
            { label: 'B. No', marks: 0 },
            { label: 'C. Needs Improvement', marks: 1 },
          ],
          category: InpectionQuestionCategory.LearningMaterials,
          question: 'Driving School has a Traffic Laws & Regulations Handbook',
          correctAnswer: 'A. Yes',
          id: 7,
        },
      ],
      stateId: 25,
    };

    await inspectionQuestionRepository.save({
      questions: inspectionQuestionsData.questions,
      stateId: inspectionQuestionsData.stateId,
      createdBy: adminUser,
    });
  }
}
