import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFamilyDto } from './dto/create-family.dto';
import { Family } from './entities/family.entity';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<Family>,@InjectModel('Student') private studentModel: Model<Student> 
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
      path: 'children',
      select: 'firstName lastName', 
    })
    .exec();

    return family;
  }

  async findOne(id: string): Promise<Family> {
    const family = await this.familyModel.findById(id).populate({
      path:'children', // Field containing student ObjectIds
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

  async addChild(familyId: string, studentId: string): Promise<Family> {
    try {
      const family = await this.familyModel.findById(familyId);
      if (!family) {
        throw new NotFoundException(`Family with ID ${familyId} not found`);
      }

      const student = await this.studentModel.findById(studentId);
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      const studentObjectId = new Types.ObjectId(studentId);
      const familyObjectId = new Types.ObjectId(familyId);

      // Check if student is already a member
      if (family.children.some(child => child.toString() === studentObjectId.toString())) {
        throw new BadRequestException('Student is already a member of this family');
      }

      if (family.children.length >= 2) {
        throw new BadRequestException('Family already has maximum number of children (2)');
      }

      // Add the student to the family
      family.children.push(studentObjectId as any);
      student.familyId = familyObjectId as any;
      
      await Promise.all([
        family.save(),
        student.save()
      ]);

      return family;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add child to family');
    }
  }
}