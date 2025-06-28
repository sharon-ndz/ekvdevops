import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import {
  ListTransactionLogDto,
  PaymentDetailsDto,
  PaymentDto,
  PaymentSettingsDto,
  PaymentSettingsListRequestsDto,
  RevenueStatsWithYearDto,
  TransactionResponseDto,
  UpdatePaymentDto,
  UpdatePaymentSettingsDto,
  ValidateTransactionDto,
} from './payment.dto';
import { PaymentData } from './payment.data';
import {
  Currency,
  LicenseRequestType,
  LicenseStatus,
  PaymentGateway,
  PaymentStatus,
  PreRegistrationStatus,
  Reference,
  ReportServiceTypeLabel,
  Status,
  TransactionType,
} from '../../core/constants/enums';
import qs from 'qs';
import axios from 'axios';
import { EmailNotification } from '../../entities/email-notification.entity';
import { License } from '../../entities/license.entity';
import { PreRegistration } from '../../entities/pre-registration.entity';
import {
  calculatePercentageDifference,
  generatePreRegApplicationNo,
  getLicenseApprovalData,
  getMonthDateRange,
  getMonthName,
} from '../../core/helpers/general';
import { PaymentSetting } from '../../entities/payment-setting.entity';
import {
  AuthUserInfo,
  DataResultInterface,
  LgaRevenueRaw,
  LicenseRevenueStats,
  MonthlyChartDataPoint,
  MonthlyRevenueRaw,
  RevenueStats,
  ServiceTypeDistributionPoint,
  LgaRevenuePoint,
  StateAndEntityType,
} from '../../core/interfaces/all.interface';
import { MESSAGES } from '../../core/constants/messages';
import { appConstants, FCMBPayment, lgas, transactionTypesMap } from "../../core/constants/constants";
import { mailer, paystack } from '../../core/helpers';
import { getPagination } from '../../core/helpers/functions.helpers';
import { beginTransaction } from '../../core/interfaces/all.dto';
import { plainToInstance } from 'class-transformer';
import { Role } from '../../middlewares/roles';
import { Permit } from '../../entities/permit.entity';
import { ApproveLicenseDto } from '../license/license.dto';

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
    @InjectRepository(Permit)
    private readonly permitRepository: Repository<Permit>,
    private dataSource: DataSource,
  ) {}

  private async getRevenueData(
    stateAndEntity: StateAndEntityType,
    licenseRequestType?: LicenseRequestType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    let queryBuilder: SelectQueryBuilder<License> | SelectQueryBuilder<Permit>;

    if (stateAndEntity.entityType === 'license') {
      queryBuilder = this.licenseRepository
        .createQueryBuilder('license')
        .innerJoin(Payment, 'payment', 'payment.id = license.transactionId')
        .where('license.stateId = :stateId', { stateId: stateAndEntity.stateId });

      if (startDate && endDate) {
        queryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }
      queryBuilder.andWhere('payment.status = :status', { status: PaymentStatus.Used });

      if (licenseRequestType) {
        queryBuilder.andWhere('license.requestType = :requestType', {
          requestType: licenseRequestType,
        });
      }
    } else {
      // permit
      queryBuilder = this.permitRepository
        .createQueryBuilder('permit')
        .innerJoin(Payment, 'payment', 'payment.id = permit.transactionId')
        .where('permit.stateId = :stateId', { stateId: stateAndEntity.stateId });

      if (startDate && endDate) {
        queryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }
      queryBuilder.andWhere('payment.status = :status', { status: PaymentStatus.Used });
    }

    const result = await queryBuilder
      .select('SUM(CAST(payment.amount AS NUMERIC))', 'totalRevenue')
      .getRawOne();

    return parseFloat(result?.totalRevenue) || 0;
  }

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
      if (data.drivingSchoolId) {
        queryBuilder.andWhere('paymentSettings.drivingSchoolId = :drivingSchoolId', {
          drivingSchoolId: data.drivingSchoolId,
        });
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
        where: { type: data.type, drivingSchoolId: data.drivingSchoolId },
      });
      if (setting) {
        throw new BadRequestException('Payment setting with type already exists!');
      }
      // If transaction name and prefix is not provided, try to match against payment map
      // If there is not match fail, else use map data
      if (!data.name && !data.prefix) {
        const paymentMapType = transactionTypesMap.find((item) => item.slug === data.type);
        if (!paymentMapType) {
          throw new BadRequestException('Payment setting with type does not exist!');
        }
        data.name = paymentMapType.name;
        data.prefix = paymentMapType.prefix;
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
          drivingSchoolId: data.drivingSchoolId,
        });
        if (existingTypeSetting) {
          throw new BadRequestException(`Payment type already exists`);
        }
      }

      // If transaction name and prefix is not provided, try to match against payment map
      // If there is no match fail, else use map data
      if (!data.name && !data.prefix) {
        const paymentMapType = transactionTypesMap.find((item) => item.slug === data.type);
        if (!paymentMapType) {
          throw new BadRequestException('Payment setting with type does not exist!');
        }
        data.name = paymentMapType.name;
        data.prefix = paymentMapType.prefix;
      }
      // merge existing data to new and update
      const updatedSetting = { ...existingSetting, ...data };
      const payload = plainToInstance(PaymentSetting, updatedSetting);
      await queryRunner.manager.save(PaymentSetting, payload);
      // Commit the transaction
      await queryRunner.commitTransaction();
      response.data = payload;
      response.success = true;
      response.message = MESSAGES.recordUpdated;
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
      // set message
      response.message = verificationResp.message;
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
        // check the status of transaction
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
   * Get revenue summary stats
   * @param user
   */
  async getRevenueSummary(user: AuthUserInfo): Promise<{
    licenses: LicenseRevenueStats;
    permits: RevenueStats;
  }> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const { startDate: currentMonthStart, endDate: currentMonthEnd } = getMonthDateRange(
      currentYear,
      currentMonth,
    );

    const { startDate: previousMonthStart, endDate: previousMonthEnd } = getMonthDateRange(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1,
    );

    const licenseStateAndEntityType: StateAndEntityType = {
      stateId: user.stateId,
      entityType: 'license',
    };
    const permitStateAndEntityType: StateAndEntityType = {
      stateId: user.stateId,
      entityType: 'permit',
    };

    const allTimeAllLicensesRevenue = await this.getRevenueData(licenseStateAndEntityType);
    const allTimeNewLicensesRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.New,
    );
    const allTimeRenewalLicensesRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Renewal,
    );
    const allTimeReplacementLicensesRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Replacement,
    );
    const allTimePermitsRevenue = await this.getRevenueData(permitStateAndEntityType);

    // All Licenses
    const currentMonthAllLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      undefined,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMonthAllLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      undefined,
      previousMonthStart,
      previousMonthEnd,
    );

    // New Licenses
    const currentMonthNewLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.New,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMonthNewLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.New,
      previousMonthStart,
      previousMonthEnd,
    );

    // Renewal Licenses
    const currentMonthRenewalLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Renewal,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMonthRenewalLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Renewal,
      previousMonthStart,
      previousMonthEnd,
    );

    // Replacement Licenses
    const currentMonthReplacementLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Replacement,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMonthReplacementLicensesRevenueForDiff = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Replacement,
      previousMonthStart,
      previousMonthEnd,
    );

    // Permits
    const currentMonthPermitsRevenueForDiff = await this.getRevenueData(
      permitStateAndEntityType,
      undefined,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMonthPermitsRevenueForDiff = await this.getRevenueData(
      permitStateAndEntityType,
      undefined,
      previousMonthStart,
      previousMonthEnd,
    );

    // --- Construct Final Stats ---
    const allLicensesStats: RevenueStats = {
      totalAmount: allTimeAllLicensesRevenue, // Using all-time
      percentageDifference: calculatePercentageDifference(
        currentMonthAllLicensesRevenueForDiff,
        previousMonthAllLicensesRevenueForDiff,
      ),
    };

    const newLicensesStats: RevenueStats = {
      totalAmount: allTimeNewLicensesRevenue, // Using all-time
      percentageDifference: calculatePercentageDifference(
        currentMonthNewLicensesRevenueForDiff,
        previousMonthNewLicensesRevenueForDiff,
      ),
    };

    const renewalLicensesStats: RevenueStats = {
      totalAmount: allTimeRenewalLicensesRevenue, // Using all-time
      percentageDifference: calculatePercentageDifference(
        currentMonthRenewalLicensesRevenueForDiff,
        previousMonthRenewalLicensesRevenueForDiff,
      ),
    };

    const replacementLicensesStats: RevenueStats = {
      totalAmount: allTimeReplacementLicensesRevenue, // Using all-time
      percentageDifference: calculatePercentageDifference(
        currentMonthReplacementLicensesRevenueForDiff,
        previousMonthReplacementLicensesRevenueForDiff,
      ),
    };

    const permitsStats: RevenueStats = {
      totalAmount: allTimePermitsRevenue, // Using all-time
      percentageDifference: calculatePercentageDifference(
        currentMonthPermitsRevenueForDiff,
        previousMonthPermitsRevenueForDiff,
      ),
    };

    return {
      licenses: {
        allLicenses: allLicensesStats,
        newLicenses: newLicensesStats,
        renewalLicenses: renewalLicensesStats,
        replacementLicenses: replacementLicensesStats,
      },
      permits: permitsStats,
    };
  }

  /**
   * Get total revenue grouped by month
   * @param data
   * @param user
   */
  async getMonthlyRevenueVolume(
    data: RevenueStatsWithYearDto,
    user: AuthUserInfo,
  ): Promise<MonthlyChartDataPoint[]> {
    const stateId = user.stateId;
    const successfulPaymentStatus = PaymentStatus.Used;
    const year = data.year;

    const licenseMonthlyRevenuesRaw: MonthlyRevenueRaw[] = await this.licenseRepository
      .createQueryBuilder('license')
      .innerJoin(Payment, 'payment', 'payment.id = license.transactionId')
      .select('EXTRACT(MONTH FROM payment.createdAt) AS month')
      .addSelect('SUM(CAST(payment.amount AS NUMERIC)) AS totalRevenue')
      .where('license.stateId = :stateId', { stateId })
      .andWhere('EXTRACT(YEAR FROM payment.createdAt) = :year', { year })
      .andWhere('payment.status = :status', { status: successfulPaymentStatus })
      .groupBy('EXTRACT(MONTH FROM payment.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // --- Query for Permit revenue grouped by month ---
    const permitMonthlyRevenuesRaw: MonthlyRevenueRaw[] = await this.permitRepository
      .createQueryBuilder('permit')
      .innerJoin(Payment, 'payment', 'payment.id = permit.transactionId')
      .select('EXTRACT(MONTH FROM payment.createdAt) AS month')
      .addSelect('SUM(CAST(payment.amount AS NUMERIC)) AS totalRevenue')
      .where('permit.stateId = :stateId', { stateId })
      .andWhere('EXTRACT(YEAR FROM payment.createdAt) = :year', { year })
      .andWhere('payment.status = :status', { status: successfulPaymentStatus })
      .groupBy('EXTRACT(MONTH FROM payment.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Initialize results for 12 months
    const aggregatedMonthlyData: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      aggregatedMonthlyData[i] = 0;
    }

    // Process license revenues
    for (const raw of licenseMonthlyRevenuesRaw) {
      // Month from EXTRACT is 1-12. Ensure it's treated as a number.
      const monthNumber = Number(raw.month);
      if (monthNumber >= 1 && monthNumber <= 12) {
        aggregatedMonthlyData[monthNumber] += parseFloat(raw.totalRevenue) || 0;
      }
    }

    // Process permit revenues
    for (const raw of permitMonthlyRevenuesRaw) {
      const monthNumber = Number(raw.month);
      if (monthNumber >= 1 && monthNumber <= 12) {
        aggregatedMonthlyData[monthNumber] += parseFloat(raw.totalRevenue) || 0;
      }
    }

    // Format for chart output
    const chartData: MonthlyChartDataPoint[] = [];
    for (let i = 1; i <= 12; i++) {
      chartData.push({
        month: getMonthName(i),
        revenue: parseFloat(aggregatedMonthlyData[i].toFixed(2)), // Ensure revenue is a number and formatted
      });
    }

    return chartData;
  }

  /**
   * Get total revenue grouped by request type
   * @param user
   */
  async getTotalRevenueGroupedByService(
    user: AuthUserInfo,
  ): Promise<ServiceTypeDistributionPoint[]> {
    const licenseStateAndEntityType: StateAndEntityType = {
      stateId: user.stateId,
      entityType: 'license',
    };
    const permitStateAndEntityType: StateAndEntityType = {
      stateId: user.stateId,
      entityType: 'permit',
    };

    const newLicenseRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.New,
    );
    const renewalLicenseRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Renewal,
    );
    const replacementLicenseRevenue = await this.getRevenueData(
      licenseStateAndEntityType,
      LicenseRequestType.Replacement,
    );
    const permitRevenue = await this.getRevenueData(permitStateAndEntityType);

    const totalRevenue =
      newLicenseRevenue + renewalLicenseRevenue + replacementLicenseRevenue + permitRevenue;

    const results: ServiceTypeDistributionPoint[] = [];

    if (totalRevenue === 0) {
      results.push({ label: ReportServiceTypeLabel.NewLicense, percentage: 0 });
      results.push({ label: ReportServiceTypeLabel.RenewalLicense, percentage: 0 });
      results.push({ label: ReportServiceTypeLabel.ReplacementLicense, percentage: 0 });
      results.push({ label: ReportServiceTypeLabel.Permits, percentage: 0 });
    } else {
      results.push({
        label: ReportServiceTypeLabel.NewLicense,
        percentage: parseFloat(((newLicenseRevenue / totalRevenue) * 100).toFixed(2)),
      });
      results.push({
        label: ReportServiceTypeLabel.RenewalLicense,
        percentage: parseFloat(((renewalLicenseRevenue / totalRevenue) * 100).toFixed(2)),
      });
      results.push({
        label: ReportServiceTypeLabel.ReplacementLicense,
        percentage: parseFloat(((replacementLicenseRevenue / totalRevenue) * 100).toFixed(2)),
      });
      results.push({
        label: ReportServiceTypeLabel.Permits,
        percentage: parseFloat(((permitRevenue / totalRevenue) * 100).toFixed(2)),
      });
    }

    return results;
  }

  /**
   * Get top 5 revenue by LGA
   * @param user
   */
  async getTopRevenueByLga(user: AuthUserInfo): Promise<LgaRevenuePoint[]> {
    const stateId = user.stateId;
    const successfulPaymentStatus = PaymentStatus.Used;

    // Get revenue raw
    const licenseRevenuesByLga: LgaRevenueRaw[] = await this.queryLicenseRevenueByStateIdAndStatus(
      stateId,
      successfulPaymentStatus,
    );

    const permitRevenuesByLga: LgaRevenueRaw[] = await this.queryPermitRevenueByStateIdAndStatus(
      stateId,
      successfulPaymentStatus,
    );

    const combinedLgaRevenues: Record<number, number> = {};

    for (const item of licenseRevenuesByLga) {
      const lgaId = Number(item.lgaId);
      // Ensure lgaId is a valid number before using as a key
      if (item.lgaId !== null && !isNaN(lgaId)) {
        const revenue = parseFloat(item.totalRevenue) || 0;
        combinedLgaRevenues[lgaId] = (combinedLgaRevenues[lgaId] || 0) + revenue;
      }
    }

    for (const item of permitRevenuesByLga) {
      const lgaId = Number(item.lgaId);
      // Ensure lgaId is a valid number before using as a key
      if (item.lgaId !== null && !isNaN(lgaId)) {
        const revenue = parseFloat(item.totalRevenue) || 0;
        combinedLgaRevenues[lgaId] = (combinedLgaRevenues[lgaId] || 0) + revenue;
      }
    }

    let sortedLgas = Object.entries(combinedLgaRevenues)
      .map(([lgaIdStr, totalRevenue]) => ({
        lgaId: Number(lgaIdStr),
        totalRevenue: totalRevenue, // Keep full precision for sorting
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    if (sortedLgas.length) {
      const lgaNameMap = new Map(lgas.map((lga) => [lga.id, lga.name]));
      sortedLgas = sortedLgas.map((lga) => ({
        ...lga,
        lgaName: lgaNameMap.get(lga.lgaId) || 'Unknown LGA',
      }));
    }

    return sortedLgas.slice(0, 5).map((lga) => ({
      ...lga,
      totalRevenue: parseFloat(lga.totalRevenue.toFixed(2)),
    }));
  }

  /**
   * Get bottom 5 revenue by LGA
   * @param user
   */
  async getBottomRevenueByLga(user: AuthUserInfo): Promise<LgaRevenuePoint[]> {
    const stateId = user.stateId;
    const successfulPaymentStatus = PaymentStatus.Used;
    // Get revenue raw
    const licenseRevenuesByLga: LgaRevenueRaw[] = await this.queryLicenseRevenueByStateIdAndStatus(
      stateId,
      successfulPaymentStatus,
    );

    const permitRevenuesByLga: LgaRevenueRaw[] = await this.queryPermitRevenueByStateIdAndStatus(
      stateId,
      successfulPaymentStatus,
    );

    const combinedLgaRevenues: Record<number, number> = {};

    for (const item of licenseRevenuesByLga) {
      const lgaId = Number(item.lgaId);
      if (item.lgaId !== null && !isNaN(lgaId)) {
        const revenue = parseFloat(item.totalRevenue) || 0;
        combinedLgaRevenues[lgaId] = (combinedLgaRevenues[lgaId] || 0) + revenue;
      }
    }

    for (const item of permitRevenuesByLga) {
      const lgaId = Number(item.lgaId);
      if (item.lgaId !== null && !isNaN(lgaId)) {
        const revenue = parseFloat(item.totalRevenue) || 0;
        combinedLgaRevenues[lgaId] = (combinedLgaRevenues[lgaId] || 0) + revenue;
      }
    }

    // 4. Convert to array, sort for BOTTOM 5, and get bottom 5
    let sortedLgas = Object.entries(combinedLgaRevenues)
      .map(([lgaIdStr, totalRevenue]) => ({
        lgaId: Number(lgaIdStr),
        totalRevenue: totalRevenue, // Keep full precision for sorting
      }))
      // Core Change: Sort in ascending order for bottom LGAs
      .sort((a, b) => a.totalRevenue - b.totalRevenue);

    if (sortedLgas.length) {
      const lgaNameMap = new Map(lgas.map((lga) => [lga.id, lga.name]));
      sortedLgas = sortedLgas.map((lga) => ({
        ...lga,
        lgaName: lgaNameMap.get(lga.lgaId) || 'Unknown LGA',
      }));
    }

    return sortedLgas.slice(0, 5).map((lga) => ({
      ...lga,
      totalRevenue: parseFloat(lga.totalRevenue.toFixed(2)),
    }));
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

  async queryLicenseRevenueByStateIdAndStatus(
    stateId: number,
    successfulPaymentStatus: any,
  ): Promise<LgaRevenueRaw[]> {
    return this.licenseRepository
      .createQueryBuilder('license')
      .innerJoin(Payment, 'payment', 'payment.id = license.transactionId')
      .select('license.lgaId', 'lgaId')
      .addSelect('SUM(CAST(payment.amount AS NUMERIC))', 'totalRevenue')
      .where('license.stateId = :stateId', { stateId })
      .andWhere('payment.status = :status', { status: successfulPaymentStatus })
      .andWhere('license.lgaId IS NOT NULL')
      .groupBy('license.lgaId')
      .getRawMany();
  }

  async queryPermitRevenueByStateIdAndStatus(
    stateId: number,
    successfulPaymentStatus: any,
  ): Promise<LgaRevenueRaw[]> {
    return this.permitRepository
      .createQueryBuilder('permit')
      .innerJoin(Payment, 'payment', 'payment.id = permit.transactionId')
      .select('permit.lgaId', 'lgaId')
      .addSelect('SUM(CAST(payment.amount AS NUMERIC))', 'totalRevenue')
      .where('permit.stateId = :stateId', { stateId })
      .andWhere('payment.status = :status', { status: successfulPaymentStatus })
      .andWhere('permit.lgaId IS NOT NULL')
      .groupBy('permit.lgaId')
      .getRawMany();
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

        // Approve License (to be ready for printout) if license record exists
        if (license) {
          await this.approveLicense(
            {
              licenseId: license.id,
              licenseClassId: license.licenseClassId,
              years: license.years,
            } as ApproveLicenseDto,
            null,
          );
        }
      }
    }
  }

  async getRevenueStats(allowedTypes: TransactionType[]): Promise<PaymentData> {
    const revenueStats = await this.paymentRepository
      .createQueryBuilder('transactions')
      .select('transactions.itemType', 'itemType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transactions.amount)', 'totalAmount')
      .where('transactions.status = :status', { status: PaymentStatus.Used })
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

    // Create a map for easier lookup
    const revenueMap = new Map<string, { count: number; amount: number }>();
    for (const item of revenueStats) {
      revenueMap.set(item.itemType, {
        count: parseInt(item.count, 10),
        amount: parseFloat(item.totalAmount),
      });
    }

    // Ensure all allowedTypes are included
    const revenue = allowedTypes.map((type) => {
      const data = revenueMap.get(type);
      return {
        itemType: type,
        count: data?.count ?? 0,
        amount: data?.amount ?? 0,
      };
    });

    return {
      revenue,
      refunded: {
        count: parseInt(refundedStats?.count || '0', 10),
        amount: parseFloat(refundedStats?.totalAmount || '0'),
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
    let allowedTypes: TransactionType[] = [];
    const roleId = user.roleId;

    if (roleId === Role.LASDRI_ADMIN) {
      allowedTypes = [
        TransactionType.drivingSchoolCompletionPayment,
        TransactionType.drivingSchoolApplication,
        TransactionType.inspectionFee,
      ];
    }

    if (roleId === Role.DVIS_ADMIN) {
      allowedTypes = [TransactionType.preRegistration, TransactionType.cbtReschedulePayment];
    }

    if (roleId === Role.MVAA_ADMIN) {
      allowedTypes = [
        TransactionType.newLicense,
        TransactionType.licenseRenewal,
        TransactionType.licenseReplacement,
        TransactionType.permitIssuance,
      ];
    }

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
          '(transactions.email LIKE :search OR transactions.reference LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (allowedTypes.length > 0) {
        queryBuilder.andWhere('transactions.itemType IN (:...allowedTypes)', { allowedTypes });
      }

      queryBuilder.skip(offset);
      queryBuilder.take(limit);
      queryBuilder.orderBy('transactions.createdAt', data.order);

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

  /**
   * Approve License [internal update without throw]
   * If this fails, it can still be approved separately later
   * @param data
   * @param user
   */
  async approveLicense(data: ApproveLicenseDto, user: AuthUserInfo): Promise<DataResultInterface> {
    //^ set variables
    const response = { success: false, message: '', data: null };
    const queryRunner = await beginTransaction(this.dataSource);

    try {
      // Get license information
      const license = await queryRunner.manager.findOne(License, {
        where: { id: data.licenseId },
        relations: ['preRegistration.student.application'],
      });
      if (license && license.status !== LicenseStatus.Completed) {
        // Get license approval data
        const approvalData: any = await getLicenseApprovalData(
          data,
          queryRunner.manager.getRepository(License),
        );
        // Set other details
        if (user) {
          approvalData.issuedById = user.id;
        }
        approvalData.licenseClassId = data.licenseClassId;
        approvalData.years = data.years;
        approvalData.status = LicenseStatus.Completed;
        approvalData.isActive = Status.Active;

        // Update license
        await queryRunner.manager.update(License, { id: license.id }, approvalData);

        // Update the pre-registration data
        await queryRunner.manager.update(
          PreRegistration,
          { id: license.preRegistrationId },
          { status: PreRegistrationStatus.Completed },
        );

        // Commit transaction
        await queryRunner.commitTransaction();

        // Send email notification
        const fullName = [license.firstName, license.middleName, license.lastName].join(' ');
        await mailer
          .setSubject(MESSAGES.licenseApproved)
          .setMessage(
            MESSAGES.licenseEmailBody(
              license.preRegistration.applicationNo,
              approvalData.licenseNo,
              fullName,
            ),
          )
          .setTo(license.email)
          .setEmailNotificationRepository(queryRunner.manager.getRepository(EmailNotification))
          .sendDefault();

        response.data = approvalData;
        response.success = true;
        response.message = MESSAGES.approvedSuccessful;
      }
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.log(error);
      response.message = error.message;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
    return response;
  }
}
