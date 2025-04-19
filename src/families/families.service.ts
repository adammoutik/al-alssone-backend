import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFamilyDto } from './dto/create-family.dto';
import { Family } from './entities/family.entity';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<Family>,
  ) {}

  async create(createFamilyDto: CreateFamilyDto): Promise<Family> {
    try {
      const family = this.familyModel.create(createFamilyDto);
      return family;
    } catch (error) {
      throw new NotFoundException('Error creating family', error.message);
      
    }
  }

  async findAll(): Promise<Family[]> {

    const family = await this.familyModel
    .find()
    .populate({
      path: 'members', // Field containing student ObjectIds
      select: 'firstName lastName', // Only include these fields
    })
    .exec();

    return family;
  }

  async findOne(id: string): Promise<Family> {
    const family = await this.familyModel.findById(id).populate({
      path:'members', // Field containing student ObjectIds
      select: 'firstName lastName', // Only include these fields
    }).exec();
    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return family;
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family> {
    const updatedFamily = await this.familyModel
      .findByIdAndUpdate(id, updateFamilyDto, { new: true })
      .exec();
    if (!updatedFamily) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return updatedFamily;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.familyModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return { deleted: true };
  }
}