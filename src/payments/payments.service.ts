import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Fee } from 'src/fees/entities/fee.entity';
import { Payment } from './entities/payment.entity';
import { Student } from 'src/students/entities/student.entity';
import { Family } from 'src/families/entities/family.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { PaymentStatus } from './entities/payment.entity';
import { ArchivedPaymentsService } from '../archived-payments/archived-payments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Fee.name) private feeConfigModel: Model<Fee>,
    @InjectModel(Family.name) private familyModel: Model<Family>,
    private readonly archivedPaymentsService: ArchivedPaymentsService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      this.logger.log('Attempting to create a new payment.');
      this.logger.debug(`Received DTO: ${JSON.stringify(createPaymentDto)}`);

      const student = await this.studentModel.findById(createPaymentDto.studentId);
      if (!student) {
        this.logger.warn(`Student with ID ${createPaymentDto.studentId} not found.`);
        throw new NotFoundException(`Student with ID ${createPaymentDto.studentId} not found`);
      }
      this.logger.log(`Found student: ${student._id}`);
      let family;
      if(student.familyId && student.familyId.toString().trim() !== ''){
        family = await this.familyModel.findById(student.familyId);
        if (!family) {
          this.logger.warn(`Family with ID ${student.familyId} not found for student ${createPaymentDto.studentId}.`);
        } else {
          this.logger.log(`Found family: ${family._id}`);
        }
      } else {
        this.logger.warn(`No valid family ID found for student ${createPaymentDto.studentId}.`);
      }

      const fees = await this.feeConfigModel.find({ _id: { $in: createPaymentDto.feeId } });
      if (fees.length !== createPaymentDto.feeId.length) {
        throw new NotFoundException('One or more fees not found');
      }
      const calculatedAmountPaid = fees.reduce((sum, fee) => sum + fee.amount, 0);
      this.logger.log(`Calculated amount paid from fees: ${calculatedAmountPaid}`);

      const paymentDate = createPaymentDto.createdAt ? new Date(createPaymentDto.createdAt) : new Date();
      const calculatedPeriod = this.calculatePeriod(paymentDate, fees);
      this.logger.log(`Calculated period: ${calculatedPeriod}`);

      this.logger.log('Creating payment record...');

      let payment; 
      if(family){
         payment = await this.paymentModel.create({
          ...createPaymentDto,
          familyId: family._id || null,
          amountPaid: calculatedAmountPaid,
          period: calculatedPeriod,
          createdAt: paymentDate
        }) as Payment & Document; 
      }else{
         payment = await this.paymentModel.create({
          ...createPaymentDto,
          amountPaid: calculatedAmountPaid,
          period: calculatedPeriod,
          createdAt: paymentDate
        }) as Payment & Document; 
      }
      this.logger.log(`Payment record created with ID: ${payment._id}`);

      // initial reminders for new payment
      const initialOverdueDate = await this.getPaymentOverdueDate(payment); 

      if(family && initialOverdueDate){
        await this.notificationsService.createPaymentReminders(
          payment._id.toString(),
          family._id.toString(),
          initialOverdueDate,
        );
        this.logger.log('Payment reminders created successfully for new payment.');
      }

      return payment;
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create payment');
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find()
      .populate('familyId')
      .populate('feeId')
      .exec();
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentModel
        .findById(id)
        .populate('familyId')
        .populate('feeId')
        .exec();
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch payment');
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    try {
      const payment = await this.paymentModel
        .findByIdAndUpdate(id, updatePaymentDto, { new: true })
        .populate('familyId')
        .populate('feeId')
        .exec();
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update payment');
    }
  }

  async remove(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentModel.findByIdAndDelete(id).exec() as Payment & Document; // Cast result
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete payment');
    }
  }

  async findByFamily(familyId: string): Promise<Payment[]> {
    return this.paymentModel.find({ familyId })
      .populate('familyId')
      .populate('feeId')
      .exec();
  }

  private isSummerMonth(month: number): boolean {
    return month >= 6 && month <= 8;
  }

  @Cron('0 0 * * *') // Every day at midnight
  async updatePaymentStatuses(): Promise<void> {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); 

      // handle reminders and overdue statuses for unpaid payments

      const unpaidPayments = await this.paymentModel.find({
        status: PaymentStatus.unpaid,
        isArchived: false
      }).populate('feeId'); 

      for (const payment of unpaidPayments) {
        if (!payment.feeId || payment.feeId.length === 0) {
          this.logger.warn(`Payment ${payment._id} has no associated fees`);
          continue;
        }

        const paymentOverdueDate = await this.getPaymentOverdueDate(payment);
        paymentOverdueDate.setHours(0, 0, 0, 0); 

        const reminderDaysAhead = [7, 3, 1]; 
        for (const daysBefore of reminderDaysAhead) {
          const reminderDate = new Date(paymentOverdueDate);
          reminderDate.setDate(reminderDate.getDate() - daysBefore);
          reminderDate.setHours(0, 0, 0, 0);

          if (currentDate.getTime() === reminderDate.getTime()) {
            const family = payment.familyId ? await this.familyModel.findById(payment.familyId) : null;
            if (family && family._id) {
              await this.notificationsService.createPaymentReminders(
                payment._id.toString(),
                family._id.toString(),
                paymentOverdueDate
              );
              this.logger.log(`Reminder triggered for payment ${payment._id} (${daysBefore} days before overdue).`);
            } else {
              this.logger.warn(`No valid family found for payment ${payment._id}. Skipping reminder for this payment.`);
            }
          }
        }

        // Mark as overdue if current date is past the overdue date
        if (currentDate.getTime() > paymentOverdueDate.getTime() && payment.status === PaymentStatus.unpaid) {

          this.logger.log(`Payment ${payment._id} is now considered OVERDUE (status remains UNPAID).`);

          const family = payment.familyId ? await this.familyModel.findById(payment.familyId) : null;
          if (family && family._id) {
            await this.notificationsService.sendPaymentOverdue(payment._id.toString());
            this.logger.log(`Overdue notice sent for payment ${payment._id}.`);
          } else {
            this.logger.warn(`No valid family found for payment ${payment._id}. Skipping overdue notice for this payment.`);
          }
        }
      }

      // (create next period's payment)
      const paidPayments = await this.paymentModel.find({
        status: PaymentStatus.paid,
        isArchived: false
      }).populate('feeId');

      for (const payment of paidPayments) {
        const paymentPeriodEndDate = await this.getPaymentOverdueDate(payment); 
        if (currentDate.getTime() > paymentPeriodEndDate.getTime()) {
          await this.archivePayment(payment._id.toString());

          const newPayment = new this.paymentModel({
            studentId: payment.studentId,
            feeId: payment.feeId as Types.ObjectId[], 
            familyId: payment.familyId,
            amountPaid: payment.amountPaid, 
            discountApplied: payment.discountApplied,
            period: await this.calculateNextPeriod(payment.period, payment.feeId[0]), 
            status: PaymentStatus.unpaid 
          });
            
          await newPayment.save();
          this.logger.log(`New payment created for next period for student ${payment.studentId}.`);

        }
      }

    } catch (error) {
      this.logger.error(`Error in updatePaymentStatuses: ${error.message}`, error.stack);
    }
  }

  async archivePayment(paymentId: string): Promise<void> {
    const payment = await this.paymentModel.findById(paymentId); 
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    await this.archivedPaymentsService.create({
      originalPaymentId: payment._id.toString(),
      studentId: payment.studentId,
      period: payment.period,
      status: payment.status,
      archivedAt: new Date()
    });

    await this.paymentModel.findByIdAndUpdate(paymentId, { 
      isArchived: true,
      archivedAt: new Date()
    });
  }

  
  public async getPaymentOverdueDate(payment: Payment & Document): Promise<Date> { 
    const period = payment.period;
    const primaryFee = payment.feeId && payment.feeId.length > 0 ? payment.feeId[0] as unknown as Fee : null;

    if (!primaryFee) {
      this.logger.warn(`No primary fee found for payment ${payment._id}, assuming monthly period for overdue date.`);
      const [year, month] = period.split('-');
      return new Date(Number(year), Number(month), 0); 
    }

    const [yearStr, monthStr] = period.split('-');
    const year = Number(yearStr);

    if (primaryFee.frequency === 'annually') {
      return new Date(year, 11, 31); 
    } else { 
      const month = Number(monthStr); 
      return new Date(year, month, 0); 
    }
  }

  async getStudentDetails(studentId: string): Promise<Student> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  private async calculateNextPeriod(currentPeriod: string, feeId: Types.ObjectId): Promise<string> {
    const fee = await this.feeConfigModel.findById(feeId);
    const [year, month] = currentPeriod.split('-');
    
    if (fee?.frequency === 'monthly') {
      const nextMonth = month === '12' ? '01' : String(Number(month) + 1).padStart(2, '0');
      const nextYear = month === '12' ? String(Number(year) + 1) : year;
      return `${nextYear}-${nextMonth}`;
    } else if (fee?.frequency === 'annually') {
      return String(Number(year) + 1);
    }
    
    return currentPeriod;
  }

  private calculatePeriod(createdAt: Date, fees: Fee[]): string {
    const year = createdAt.getFullYear();
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const allFeesAnnually = fees.every(fee => fee.frequency === 'annually');

    if (allFeesAnnually) {
      return year.toString();
    }
    
    return `${year}-${month}`;
  }
}
