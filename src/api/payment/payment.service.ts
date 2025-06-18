import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import {
  ListTransactionLogDto,
  PaymentDetailsDto,
  PaymentDto,
  PaymentSettingsDto,
  PaymentSettingsListRequestsDto,
  TransactionResponseDto,
  UpdatePaymentDto,
  UpdatePaymentSettingsDto,
  ValidateTransactionDto,
} from './payment.dto';
import { PaymentData } from './payment.data';
import {
  Currency,
  LicenseStatus,
  PaymentGateway,
  PaymentStatus,
  PreRegistrationStatus,
  Reference,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import qs from 'qs';
import axios from 'axios';
import { EmailNotification } from '../../entities/email-notification.entity';
import { License } from '../../entities/license.entity';
import { LicenseStatsWithYearDto } from '../license/license.dto';
import { PreRegistration } from '../../entities/pre-registration.entity';
import { generatePreRegApplicationNo } from '../../core/helpers/general';
import { PaymentSetting } from '../../entities/payment-setting.entity';
import { AuthUserInfo, DataResultInterface } from '../../core/interfaces/all.interface';
import { MESSAGES } from '../../core/constants/messages';
import { appConstants, FCMBPayment } from '../../core/constants/constants';
import { paystack, mailer } from '../../core/helpers';
import { getPagination } from '../../core/helpers/functions.helpers';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentSetting)
    private readonly paymentSettingRepository: Repository<PaymentSetting>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(PreRegistration)
    private readonly preRegistrationRepository: Repository<PreRegistration>,
    private dataSource: DataSource,
  ) {}

  async settingsList(data: PaymentSettingsListRequestsDto) {
    const response = { success: false, message: '', data: null };

    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.paymentSettingRepository.createQueryBuilder('paymentSettings');
      if (data.name) {
        queryBuilder.andWhere('paymentSettings.name = :name', { name: data.name });
      }
      if (data.status) {
        queryBuilder.andWhere(`paymentSettings.status = :status`, {
          status: data.status,
        });
      }
      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('paymentSettings.name LIKE :name', { name: `%${search}%` }) // Added wildcards
              .orWhere('paymentSettings.type LIKE :type', { type: `%${search}%` }); // Added wildcards
          }),
        );
      }

      const [result, count] = await queryBuilder.getManyAndCount();
      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }
      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      response.message = error.message;
    }
    return response;
  }

  async createPaymentSetting(data: PaymentSettingsDto): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Check if payment setting already exists
      const setting = await queryRunner.manager.findOne(PaymentSetting, {
        where: { type: data.type },
      });
      if (setting) {
        throw new BadRequestException('Payment setting with type already exists!');
      }
      // save settings
      const payload = plainToInstance(PaymentSetting, data);
      await queryRunner.manager.save(PaymentSetting, payload);
      // Commit the transaction
      await queryRunner.commitTransaction();
      response.data = payload;
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async updatePaymentSetting(data: UpdatePaymentSettingsDto): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      const existingSetting = await queryRunner.manager.findOneBy(PaymentSetting, { id: data.id });
      if (!existingSetting) {
        throw new NotFoundException(`Payment setting not found`);
      }
      // If the type is being updated, check for duplicates
      if (data.type && data.type !== existingSetting.type) {
        const existingTypeSetting = await queryRunner.manager.findOneBy(PaymentSetting, {
          type: data.type,
        });
        if (existingTypeSetting) {
          throw new BadRequestException(`Payment type already exists`);
        }
      }
      // merge existing data to new and update
      const updatedSetting = { ...existingSetting, ...data };
      const payload = plainToInstance(PaymentSetting, updatedSetting);
      await queryRunner.manager.save(PaymentSetting, payload);
      // Commit the transaction
      await queryRunner.commitTransaction();
      response.data = payload;
      response.success = true;
      response.message = MESSAGES.recordAdded;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  /**
   * Auto Detect Payment Gateway
   * @param paymentObject
   * @param request
   */
  async initiate(paymentObject: PaymentDto, request: any) {
    const response = { success: false, message: '', data: null };

    try {
      // get the location of the payment request
      let isNigeriaIp: boolean =
        request.location && request.location.countryLong.toLocaleLowerCase() === 'nigeria';
      // If request.location is undefined, use Nigeria
      if (typeof request.location === 'undefined') {
        isNigeriaIp = true;
      }
      const currency = isNigeriaIp ? Currency.NGN : Currency.USD;
      // Get payment settings
      const setting = await this.paymentSettingRepository.findOne({
        where: {
          currency,
          type: paymentObject.type,
          drivingSchoolId: paymentObject.drivingSchoolId,
          status: Status.Active,
        },
      });
      if (!setting) {
        throw new NotFoundException('Payment setting for this payment does not exist');
      }
      // Get payment details with required calculations result
      const details = PaymentData.getDetails(setting);

      //Auto-detect the payment method to trigger based on client location
      if (isNigeriaIp) {
        return this.initiatePaystackPayment(paymentObject, details);
      }

      // return FCMB master card payment if found abroad
      return this.initiateFCMBPayment(paymentObject, details);
    } catch (error: any) {
      console.error(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Verify Payment
   * @param data
   */
  async verify(data: ValidateTransactionDto) {
    let verificationResp: any;
    const response = {
      success: false,
      message: 'Payment failed',
      status: PaymentStatus.Failed,
      paymentData: null,
    };

    try {
      const payment = await this.paymentRepository.findOne({
        where: {
          reference: data.reference,
          refunded: false,
        },
      });

      if (!payment || payment.status === PaymentStatus.Used) {
        throw new NotFoundException('Payment reference not found or has been used');
      }

      // else verify and carry out needful updates
      if (payment.provider === PaymentGateway.PAYSTACK) {
        verificationResp = await this.verifyPaystackPayment(data);
      } else {
        verificationResp = await this.verifyFCMBPayment(data, payment);
      }

      // decode the transaction log
      const transactionLog = JSON.parse(payment.log);
      // Payment yet to be settled
      if (payment.status === PaymentStatus.Pending) {
        // Kindly proceed to settle
        let log = {
          session: payment.id,
          email: transactionLog.email,
        };
        if (verificationResp.log) {
          log = {
            ...log,
            ...verificationResp.log,
          };
        }
        payment.log = JSON.stringify(log);
        // *check status of transaction
        if (verificationResp.status === 'success') {
          // check is type and update
          switch (payment.type) {
            case TransactionType.preRegistration:
              await this.verifyPreRegistration(payment);
              break;
            case TransactionType.licenseRenewal:
            case TransactionType.licenseReplacement:
              await this.verifyLicense(payment);
              break;
          }
          // Settlement has been done and payment completed
          response.message = 'Payment completed successfully';
          payment.status = PaymentStatus.Completed;
        } else {
          payment.status = PaymentStatus.Failed;
        }
        // Update payment
        await this.paymentRepository.save(payment);
      }
      response.success = true;
      response.status = Object.values(PaymentStatus)[payment.status];
      response.paymentData = payment;
    } catch (error: any) {
      response.success = false;
      response.message = error.message;
    }
    return response;
  }

  /**
   * Update Payment
   * @param data
   */
  async updatePayment(data: UpdatePaymentDto): Promise<DataResultInterface> {
    const response = { success: false, message: '', data: null };

    try {
      const payment = await this.findPaymentBy({ reference: data.reference });
      if (!payment) {
        throw new NotFoundException(MESSAGES.recordNotFound);
      }

      // Update payment
      await this.paymentRepository.update({ id: payment.id }, data);

      response.data = data;
      response.message = MESSAGES.recordUpdated;
    } catch (error: any) {
      console.error(error);
      response.message = error.message;
    }
    return response;
  }

  /**
   * Verify payment completion
   * @param data
   */
  async validateTransaction(data: ValidateTransactionDto) {
    const payment = await this.paymentRepository.findOne({
      where: {
        reference: data.reference,
        type: data.type,
        refunded: false,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment reference not found or has been used');
    }

    return {
      success: true,
      status: payment.status,
      type: payment.type,
      message: 'Query ok',
      reference: data.reference,
    };
  }

  /**
   * Initialize Payment via FCMB payment gateway
   * @param paymentObject
   * @param details
   * @private
   */
  private async initiateFCMBPayment(paymentObject: PaymentDto, details: PaymentDetailsDto) {
    let session: any = {};
    const userId = 0;

    // set the currency of the transaction
    paymentObject.currency = details.currency;

    // set the amount of the transaction
    paymentObject.amount = details.amount == 0 ? paymentObject.amount : details.amount;

    try {
      // Create transaction
      const insertResult = await this.paymentRepository.insert({
        reference: details.reference,
        status: PaymentStatus.Pending,
        currency: paymentObject.currency,
        type: paymentObject.type,
        email: paymentObject.email,
        amount: details.amount,
        charges: details.charges,
        itemType: paymentObject.type,
        provider: PaymentGateway.FCMB,
        successRedirectUrl: paymentObject.successRedirectUrl,
        failureRedirectUrl: paymentObject.failureRedirectUrl,
        itemId: 0,
        userId: userId,
        log: JSON.stringify({}),
        createdAt: new Date(),
      });

      const transactionDetails = insertResult.raw[0];
      paymentObject.orderId = transactionDetails.id;

      const data = qs.stringify({
        apiOperation: FCMBPayment.apiOperation,
        apiUsername: FCMBPayment.username,
        apiPassword: FCMBPayment.secret,
        merchant: FCMBPayment.merchant,
        'interaction.operation': FCMBPayment.interactionOperation,
        'interaction.merchant.name': FCMBPayment.merchantName,
        'order.id': paymentObject.orderId,
        'order.amount': details.amountToPay,
        'order.currency': paymentObject.currency,
        'order.description': paymentObject.description,
        'order.reference': details.reference,
        'transaction.reference': details.reference,
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: FCMBPayment.url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      const response = await axios.request(config);
      session = PaymentData.formatFCMBResponse(response.data);

      const transactionLog = JSON.stringify({
        session: session,
        email: paymentObject.email,
        'order.id': paymentObject.orderId, // saving real value
        'order.amount': details.amount,
        'order.amountToPay': details.amountToPay,
        'order.currency': paymentObject.currency,
        'order.description': paymentObject.description,
        'order.reference': details.reference,
      });

      // Save transaction information
      await this.paymentRepository.update(transactionDetails.id, {
        log: transactionLog,
      });

      if (session.result === 'SUCCESS') {
        if (!transactionDetails) {
          throw new InternalServerErrorException(`error initializing payment`);
        }
      }
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(`error initializing payment: ${error}`);
    }

    delete session.successIndicator;
    delete session.checkoutMode;
    delete session.merchant;
    return {
      gateway: PaymentGateway.FCMB,
      ...session,
      reference: details.reference,
    };
  }

  /**
   * Initialize Payment via Paystack payment gateway
   * @param paymentObject
   * @param details
   * @private
   */
  private async initiatePaystackPayment(paymentObject: PaymentDto, details: PaymentDetailsDto) {
    paymentObject.redirectUrl = `${process.env.API_HOSTNAME}/payments/paystack-callback`;
    const userId = 0;
    const invoice = paystack
      .setAuthorization(appConstants.paymentKey)
      .setCustomer(paymentObject.email)
      .setReferenceNumber(details.reference)
      .setCurrency(details.currency)
      .setCallbackUrl(paymentObject.redirectUrl)
      .setTransactionAmount(details.amountToPay);

    const payment = await invoice.initialize();
    if (payment.success === false) {
      throw new GatewayTimeoutException(payment.message);
    }

    paymentObject.amount = details.amountToPay;
    paymentObject.currency = details.currency;

    try {
      // Save transaction record
      await this.paymentRepository.insert({
        reference: details.reference,
        status: PaymentStatus.Pending,
        currency: paymentObject.currency,
        type: paymentObject.type,
        amount: details.amount,
        charges: details.charges,
        email: paymentObject.email,
        itemType: paymentObject.type,
        provider: PaymentGateway.PAYSTACK,
        successRedirectUrl: paymentObject.successRedirectUrl,
        failureRedirectUrl: paymentObject.failureRedirectUrl,
        itemId: 0,
        log: JSON.stringify({ email: paymentObject.email }),
        userId: userId,
      });
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(`error initializing payment: ${error}`);
    }

    return {
      gateway: PaymentGateway.PAYSTACK,
      success: payment.success,
      url: payment.link,
      reference: details.reference,
    };
  }

  /**
   * Verify Paystack Payment
   * @param data
   */
  async verifyPaystackPayment(data: ValidateTransactionDto) {
    const response = {
      success: false,
      status: 'failed',
      message: 'Payment verification failed',
      log: null,
    };

    try {
      // call paystack to verify payment
      const receipt = paystack
        .setReferenceNumber(data.reference)
        .setAuthorization(appConstants.paymentKey);
      const { data: responseData } = await receipt.verify();
      // build response parameters
      response.log = responseData;
      response.success = true;
      response.status = responseData.status;
      response.message = 'Payment verification successful';
    } catch (error: any) {
      console.log(error);
      response.success = false;
      response.message = 'Payment verification failed';
    }
    return response;
  }

  /**
   * Verify FCMB Payment
   * @param data
   * @param transaction
   */
  async verifyFCMBPayment(data: ValidateTransactionDto, transaction: Payment) {
    const response = {
      success: false,
      status: 'failed',
      message: 'Payment verification failed',
      log: null,
    };

    try {
      const transactionLog = JSON.parse(transaction.log);
      if (transactionLog.session.successIndicator == data.successIndicator) {
        // build response parameters
        response.log = transactionLog.session;
        response.success = true;
        response.status = 'success';
        response.message = 'Payment verification successful';
      }
    } catch (error: any) {
      console.log(error);
      response.success = false;
      response.message = error.message;
    }
    return response;
  }

  /**
   * Calculates the total revenue for new, renewal, and replacement licenses
   */
  async getRevenueSummary(): Promise<{
    newRevenue: number;
    renewalRevenue: number;
    replacementRevenue: number;
  }> {
    const result = await this.licenseRepository
      .createQueryBuilder('licenses')
      .leftJoinAndSelect('licenses.transaction', 'transactions')
      .select([
        "SUM(CASE WHEN licenses.requestType = 'new' THEN transactions.amount ELSE 0 END) AS newRevenue",
        "SUM(CASE WHEN licenses.requestType = 'renewal' THEN transactions.amount ELSE 0 END) AS renewalRevenue",
        "SUM(CASE WHEN licenses.requestType = 'replacement' THEN transactions.amount ELSE 0 END) AS replacementRevenue",
      ])
      .getRawOne();

    return {
      newRevenue: parseFloat(result.newrevenue) || 0,
      renewalRevenue: parseFloat(result.renewalrevenue) || 0,
      replacementRevenue: parseFloat(result.replacementrevenue) || 0,
    };
  }

  /**
   * Calculates the total revenue per month
   * @param data
   */
  async getMonthlyRevenueVolume(
    data: LicenseStatsWithYearDto,
  ): Promise<{ month: number; totalRevenue: number }[]> {
    let year = new Date().getFullYear();
    if (data.year) {
      year = new Date(new Date().setFullYear(+data.year)).getFullYear();
    }
    const qb = this.licenseRepository
      .createQueryBuilder('licenses')
      .leftJoinAndSelect('licenses.transaction', 'transactions');

    qb.select([
      'EXTRACT(MONTH FROM licenses.createdAt) AS month',
      'SUM(transactions.amount) AS totalRevenue',
    ])
      .where(`EXTRACT(YEAR FROM licenses.createdAt) = :year`, { year })
      .groupBy('month')
      .orderBy('month');

    if (data.status) {
      if (data.status === 'expired') {
        qb.andWhere('licenses.expiryAt < NOW()');
      } else {
        qb.andWhere(`licenses.status = :status`, { status: data.status });
      }
    }

    if (data.type !== 'all') {
      qb.andWhere(`licenses.requestType = :type`, { type: data.type });
    }

    return qb.getRawMany();
  }

  /**
   * Calculates the total revenue for each service type (new, renewal, replacement) within a date range
   * @param startDate
   * @param endDate
   */
  async getTotalRevenueGroupedByService(
    startDate: Date,
    endDate: Date,
  ): Promise<{ service: string; totalRevenue: number }[]> {
    return this.licenseRepository
      .createQueryBuilder('licenses')
      .leftJoinAndSelect('licenses.transaction', 'transactions')
      .select(['licenses.requestType AS service', 'SUM(transactions.amount) AS totalRevenue'])
      .where('licenses.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('licenses.requestType')
      .getRawMany();
  }

  /**
   * Fetches the top 5 LGAs by total revenue within a date range
   * @param startDate
   * @param endDate
   */
  async getTopRevenueByLga(
    startDate: Date,
    endDate: Date,
  ): Promise<{ lgaId: number; totalRevenue: number }[]> {
    return this.licenseRepository
      .createQueryBuilder('licenses')
      .leftJoinAndSelect('licenses.transaction', 'transactions')
      .select(['licenses.lgaId AS lgaId', 'SUM(transactions.amount) AS totalRevenue'])
      .where('licenses.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('licenses.lgaId')
      .orderBy('totalRevenue', 'DESC')
      .limit(5)
      .getRawMany();
  }

  /**
   * Update payment record (internal use)
   * @param id
   * @param payment
   */
  async update(id: number, payment: Payment) {
    await this.paymentRepository.update(id, payment);
  }

  /**
   * Find payment by where options
   * @param where
   */
  async findPaymentBy(where: FindOptionsWhere<Payment>) {
    return await this.paymentRepository.findOneBy(where);
  }

  async verifyPreRegistration(data: any): Promise<any> {
    if (data.reference) {
      const payment = await this.findPaymentBy({ reference: data.reference });
      if (payment && payment.status === PaymentStatus.Pending) {
        // find pre registration
        const preRegistration = await this.preRegistrationRepository.findOne({
          where: { reference: payment.reference },
          relations: ['student.application'],
        });
        // Update pre-registration status only if still in pending state
        if (preRegistration && preRegistration.status === PreRegistrationStatus.Pending) {
          // Generate application no and append to data
          preRegistration.applicationNo = generatePreRegApplicationNo(preRegistration.student);
          preRegistration.status = PreRegistrationStatus.Processing;
          await this.preRegistrationRepository.update({ id: preRegistration.id }, preRegistration);
          // Update payment status
          payment.used = Reference.Used;
          payment.status = PaymentStatus.Used;
          await this.update(payment.id, payment);
          // send email
          await mailer
            .setSubject(MESSAGES.preRegistrationEmailSubject)
            .setMessage(
              MESSAGES.preRegistrationEmailBody(
                preRegistration.applicationNo,
                preRegistration.student.application.firstName,
              ),
            )
            .setTo(preRegistration.student.application.email)
            .setEmailNotificationRepository(this.emailNotificationRepository)
            .sendDefault();
        }
      }
    }
  }

  async verifyLicense(data: any): Promise<any> {
    if (data.reference) {
      const payment = await this.findPaymentBy({ reference: data.reference });
      if (payment && payment.status === PaymentStatus.Pending) {
        // find license record
        const license = await this.licenseRepository.findOne({
          where: { reference: payment.reference },
        });
        // Update license status only if still in pending state
        if (license && license.status === LicenseStatus.Pending) {
          // Generate application no and append to data
          license.status = LicenseStatus.Processing;
          await this.licenseRepository.update({ id: license.id }, license);
        }

        // Update payment status
        payment.used = Reference.Used;
        payment.status = PaymentStatus.Used;
        await this.update(payment.id, payment);
      }
    }
  }

  async getRevenueStats() {
    const allowedTypes = [
      TransactionType.drivingSchoolCompletionPayment,
      TransactionType.drivingSchoolApplication,
      TransactionType.inspectionFee,
    ];

    const revenueStats = await this.paymentRepository
      .createQueryBuilder('transactions')
      .select('transactions.itemType', 'itemType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transactions.amount)', 'totalAmount')
      .where('transactions.status = :status', { status: PaymentStatus.Completed })
      .andWhere('transactions.refunded = false')
      .andWhere('transactions.itemType IN (:...allowedTypes)', { allowedTypes })
      .groupBy('transactions.itemType')
      .getRawMany();

    const refundedStats = await this.paymentRepository
      .createQueryBuilder('transactions')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(transactions.amount)', 'totalAmount')
      .where('transactions.refunded = true')
      .andWhere('transactions.itemType IN (:...allowedTypes)', { allowedTypes })
      .getRawOne();

    return {
      revenue: revenueStats.map((item) => ({
        itemType: item.itemType,
        count: parseInt(item.count),
        amount: parseFloat(item.totalAmount),
      })),
      refunded: {
        count: parseInt(refundedStats?.count || 0),
        amount: parseFloat(refundedStats?.totalAmount || 0),
      },
    };
  }

  async listTransactionLogs(
    data: ListTransactionLogDto,
    user: AuthUserInfo,
  ): Promise<DataResultInterface<TransactionResponseDto[]>> {
    const response = { success: false, message: '', data: null };
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    try {
      const queryBuilder = this.paymentRepository.createQueryBuilder('transactions');

      if (data.type) {
        queryBuilder.andWhere('transactions.type = :type', { type: data.type });
      }

      if (data.status) {
        queryBuilder.andWhere('transactions.status = :status', { status: data.status });
      }

      if (data.reference) {
        queryBuilder.andWhere('transactions.reference LIKE :reference', {
          reference: `%${data.reference}%`,
        });
      }

      if (data.createdAtStart && data.createdAtEnd) {
        queryBuilder.andWhere('transactions.createdAt BETWEEN :start AND :end', {
          start: data.createdAtStart,
          end: data.createdAtEnd,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          '(transactions.email LIKE :search OR transactions.reference LIKE :search',
          { search: `%${search}%` },
        );
      }

      queryBuilder.skip(offset).take(limit).orderBy('transactions.createdAt', data.order);

      const [result, count] = await queryBuilder.getManyAndCount();

      if (result) {
        response.data = {
          result,
          pagination: getPagination(count, page, offset, limit),
        };
      }

      response.success = true;
      response.message = MESSAGES.recordFound;
    } catch (error: any) {
      console.log(error);
      console.log(`Queried by ${user.id}`);
      throw new InternalServerErrorException(error);
    }

    return response;
  }
}
