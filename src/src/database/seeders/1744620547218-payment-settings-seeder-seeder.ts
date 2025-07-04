import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { PaymentSetting } from '../../entities/payment-setting.entity';
import { Currency, Status, TransactionType } from '../../core/constants/enums';

export class PaymentSettingsSeederSeeder1744620547218 implements Seeder {
  track = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const paymentSettingRepository = dataSource.getRepository(PaymentSetting);
    const settings: any = [
      {
        stateId: 25,
        lgaId: 518,
        name: 'Pre Registration Payment',
        type: TransactionType.preRegistration,
        amount: 12000,
        charges: 100,
        prefix: 'PR',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'New license Payment',
        type: TransactionType.newLicense,
        amount: 10000,
        charges: 100,
        prefix: 'NL',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'Permit Issuance Payment',
        type: TransactionType.permitIssuance,
        amount: 8000,
        charges: 100,
        prefix: 'PI',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'License Replacement Payment',
        type: TransactionType.licenseReplacement,
        amount: 2000,
        charges: 100,
        prefix: 'LRI',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'License Replacement Payment',
        type: TransactionType.biometricsPayment,
        amount: 2000,
        charges: 100,
        prefix: 'BIO',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'License Renewal Payment',
        type: TransactionType.licenseRenewal,
        amount: 11200,
        charges: 100,
        prefix: 'LR',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'CBT Reschedule Payment',
        type: TransactionType.cbtReschedulePayment,
        amount: 5000,
        charges: 100,
        prefix: 'CRP',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        drivingSchoolId: 3,
        name: 'Driving School Application Payment',
        type: TransactionType.drivingSchoolApplication,
        amount: 4000,
        charges: 100,
        prefix: 'DRA',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'Inspection Fee Payment',
        type: TransactionType.inspectionFee,
        amount: 7500,
        charges: 100,
        prefix: 'ISP',
        currency: Currency.NGN,
        status: Status.Active,
      },
      {
        stateId: 25,
        lgaId: 518,
        name: 'Driving School Completion Payment',
        type: TransactionType.drivingSchoolCompletionPayment,
        amount: 8500,
        charges: 100,
        prefix: 'DCP',
        currency: Currency.NGN,
        status: Status.Active,
      },
    ];

    // Clean existing record
    await paymentSettingRepository.delete({});
    for (const setting of settings) {
      await paymentSettingRepository.insert(setting);
    }
  }
}
