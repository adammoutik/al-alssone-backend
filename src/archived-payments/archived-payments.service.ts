import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArchivedPayment } from './entities/archived-payment.entity';
import { CreateArchivedPaymentDto } from './dto/create-archived-payment.dto';
import { UpdateArchivedPaymentDto } from './dto/update-archived-payment.dto';

@Injectable()
export class ArchivedPaymentsService {
  constructor(
    @InjectModel(ArchivedPayment.name)
    private archivedPaymentModel: Model<ArchivedPayment>,
  ) {}

  async create(createArchivedPaymentDto: CreateArchivedPaymentDto): Promise<ArchivedPayment> {
    const createdPayment = new this.archivedPaymentModel(createArchivedPaymentDto);
    return createdPayment.save();
  }

  async findAll(): Promise<ArchivedPayment[]> {
    return this.archivedPaymentModel.find()
      .populate('studentId')
      .populate('feeId')
      .populate('familyId')
      .exec();
  }

  async findOne(id: string): Promise<ArchivedPayment> {
    const payment = await this.archivedPaymentModel.findById(id)
      .populate('studentId')
      .populate('feeId')
      .populate('familyId')
      .exec();
    
    if (!payment) {
      throw new NotFoundException(`Archived payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByStudent(studentId: string): Promise<ArchivedPayment[]> {
    return this.archivedPaymentModel.find({ studentId })
      .populate('studentId')
      .populate('feeId')
      .populate('familyId')
      .exec();
  }

  async findByFamily(familyId: string): Promise<ArchivedPayment[]> {
    return this.archivedPaymentModel.find({ familyId })
      .populate('studentId')
      .populate('feeId')
      .populate('familyId')
      .exec();
  }

  update(id: number, updateArchivedPaymentDto: UpdateArchivedPaymentDto) {
    return `This action updates a #${id} archivedPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} archivedPayment`;
  }
}
