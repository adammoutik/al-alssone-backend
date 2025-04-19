import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeeDto } from './dto/create-fee.dto';
import { Fee } from './entities/fee.entity';
import { UpdateFeeDto } from './dto/update-fee.dto';

@Injectable()
export class FeesService {
  constructor(@InjectModel(Fee.name) private feeModel: Model<Fee>) {}

  async create(createFeeDto: CreateFeeDto): Promise<Fee> {
    return this.feeModel.create(createFeeDto);
  }

  async findAll(): Promise<Fee[]> {
    return this.feeModel.find().exec();
  }

  //populate the members ids array with the family name
  async findOne(id: string): Promise<Fee> {

    const fee = await this.feeModel.findById(id).exec();
    if (!fee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }
    return fee;
  }

  async update(id: string, updateFeeDto: UpdateFeeDto): Promise<Fee> {
    const updatedFee = await this.feeModel
      .findByIdAndUpdate(id, updateFeeDto, { new: true })
      .exec();
    if (!updatedFee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }
    return updatedFee;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.feeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }
    return { deleted: true };
  }
}