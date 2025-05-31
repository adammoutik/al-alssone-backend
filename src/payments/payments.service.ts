import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Fee } from 'src/fees/entities/fee.entity';
import { Payment } from './entities/payment.entity';
import { Student } from 'src/students/entities/student.entity';
import { Family } from 'src/families/entities/family.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Fee.name) private feeConfigModel: Model<Fee>,
    @InjectModel(Family.name) private familyModel: Model<Family>,
  ) {}
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
 

    // Verify all fees exist and calculate total amount
    const feesInPayment :Fee[] = await this.feeConfigModel.find({ _id: { $in: createPaymentDto.feeId } });
    if (feesInPayment.length !== createPaymentDto.feeId.length) {
      throw new NotFoundException('One or more fees not found');
    }



    let totalAmount = 0;
    

    totalAmount = feesInPayment.reduce((total, fee) => {
      return total + fee.amount;
    }, 0);

    // Todo: should add the discount check 

    const family = await this.familyModel.findById(createPaymentDto.familyId);
    if (family && family.discountChild) {
      const discountChild = await this.studentModel.findById(family.discountChild);
      if (discountChild) {
        totalAmount = totalAmount * (1 - family.discountPercentage / 100);
      }
    }

    

    const payment = new this.paymentModel({
      ...createPaymentDto,
      totalAmount,
      status: 'paid', // Default to paid
    });

    return payment.save();
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

  //update the status of the payment to unpaid if the fee is overdue
  @Cron('0 0 * * *')
  async updatePaymentStatuses(): Promise<void> {
    const payments = await this.paymentModel.find().populate('feeId').exec();
    const now = new Date();

    for (const payment of payments) {
      const shouldBeUnpaid = payment.feeId.some(fee => {
        const feeConfig = fee as unknown as Fee; 
        const paymentDate = new Date(payment.createdAt);
        
        if (feeConfig.frequency === 'monthly') {
          const oneMonthLater = new Date(paymentDate);
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          return now > oneMonthLater;
        }
        if (feeConfig.frequency === 'annually') {
          const oneYearLater = new Date(paymentDate);
          oneYearLater.setMonth(oneYearLater.getMonth() + 1);
          return now > oneYearLater;
        }

        return false;
      });

      if (shouldBeUnpaid && payment.status === 'paid') {
        await this.paymentModel.findByIdAndUpdate(payment._id, { status: 'unpaid' });
      }
    }
  }
}
