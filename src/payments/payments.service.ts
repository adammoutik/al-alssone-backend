import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Fee } from 'src/fees/entities/fee.entity';
import { Payment } from './entities/payment.entity';
import { Student } from 'src/students/entities/student.entity';
import { Family } from 'src/families/entities/family.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { PaymentStatus } from './entities/payment.entity';
import { ArchivedPaymentsService } from '../archived-payments/archived-payments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
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
      const student = await this.studentModel.findById(createPaymentDto.studentId);
      if (!student) {
        throw new NotFoundException(`Student with ID ${createPaymentDto.studentId} not found`);
      }

      const family = await this.familyModel.findById(student.familyId);
      if (!family) {
        throw new NotFoundException(`Family not found for student ${createPaymentDto.studentId}`);
      }

      const payment = await this.paymentModel.create({
        ...createPaymentDto,
        familyId: family._id,
      });

      // Create notifications for the payment
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Set due date to 7 days from now
      await this.notificationsService.createPaymentReminders(
        payment._id.toString(),
        family._id.toString(),
        dueDate,
      );

      return payment;
    } catch (error) {
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
}
