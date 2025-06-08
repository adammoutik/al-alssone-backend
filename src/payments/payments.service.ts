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
      if(student.familyId){
        family = await this.familyModel.findById(student.familyId) as Family & Document;
      }
      if (!family) {
        this.logger.warn(`Family not found for student ${createPaymentDto.studentId}.`);
      }else{
        this.logger.log(`Found family: ${family._id}`);
      }
      
    

      // Calculate amountPaid from fees
      const fees = await this.feeConfigModel.find({ _id: { $in: createPaymentDto.feeId } });
      if (fees.length !== createPaymentDto.feeId.length) {
        throw new NotFoundException('One or more fees not found');
      }
      const calculatedAmountPaid = fees.reduce((sum, fee) => sum + fee.amount, 0);
      this.logger.log(`Calculated amount paid from fees: ${calculatedAmountPaid}`);

      const calculatedPeriod = await this.calculatePeriod(new Date(createPaymentDto.createdAt), createPaymentDto.feeId[0]);
      this.logger.log(`Calculated period: ${calculatedPeriod}`);

      this.logger.log('Creating payment record...');

      let payment;
      if(family){
         payment = await this.paymentModel.create({
          ...createPaymentDto,
          familyId: family._id || null,
          amountPaid: calculatedAmountPaid,
          period: calculatedPeriod,
        });
      }else{
         payment = await this.paymentModel.create({
          ...createPaymentDto,
          amountPaid: calculatedAmountPaid,
          period: calculatedPeriod,
        });
      }
      this.logger.log(`Payment record created with ID: ${payment._id}`);

      // Create notifications for the payment
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Set due date to 7 days from now
      if(family){
        await this.notificationsService.createPaymentReminders(
          payment._id.toString(),
          family._id.toString() || "",
          dueDate,
        );
      }
      this.logger.log('Payment reminders created successfully.');

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
      const payment = await this.paymentModel.findByIdAndDelete(id).exec();
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
    // Assuming summer break is from month 6 (June) to month 8 (August)
    return month >= 6 && month <= 8;
  }

  @Cron('0 0 * * *')
  async updatePaymentStatuses(): Promise<void> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const currentYear = currentDate.getFullYear();

      // Get all paid payments that are not archived
      const payments = await this.paymentModel.find({ 
        status: PaymentStatus.paid,
        isArchived: false 
      }).populate('feeId');

      for (const payment of payments) {
        const paymentDate = new Date(payment.createdAt);
        const paymentMonth = paymentDate.getMonth() + 1;
        const paymentYear = paymentDate.getFullYear();

        let monthsDifference = (currentYear - paymentYear) * 12 + (currentMonth - paymentMonth);

        // If we're in summer months don't count them for overdue status
        if (this.isSummerMonth(currentMonth)) {
          // If payment was due before summer, it's already overdue
          if (monthsDifference > 0) {
            // Archive the current payment
            await this.archivePayment(payment._id.toString());

            // Create a new payment for the next period
            const newPayment = new this.paymentModel({
              studentId: payment.studentId,
              feeId: payment.feeId,
              familyId: payment.familyId,
              amountPaid: payment.amountPaid,
              discountApplied: payment.discountApplied,
              period: await this.calculateNextPeriod(payment.period, payment.feeId[0]),
              status: PaymentStatus.unpaid
            });
            
            await newPayment.save();
          }
        } else {
          if (monthsDifference > 0) {
            // Archive the current payment
            await this.archivePayment(payment._id.toString());

            // Create a new payment for the next period
            const newPayment = new this.paymentModel({
              studentId: payment.studentId,
              feeId: payment.feeId,
              familyId: payment.familyId,
              amountPaid: payment.amountPaid,
              discountApplied: payment.discountApplied,
              period: await this.calculateNextPeriod(payment.period, payment.feeId[0]),
              status: PaymentStatus.unpaid
            });
            
            await newPayment.save();
          }
        }
      }
    } catch (error) {
      console.error('Error updating payment statuses:', error);
      throw error;
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

  async getStudentDetails(studentId: string): Promise<Student> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  private async calculatePeriod(createdAt: Date, feeId: Types.ObjectId): Promise<string> {
    const year = createdAt.getFullYear();
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const day = createdAt.getDate().toString().padStart(2, '0');

    return `${month}-${day}-${year}`;
  }
}
