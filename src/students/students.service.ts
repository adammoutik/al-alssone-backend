import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: mongoose.Model<Student>
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    try {
      const createdStudent = await this.studentModel.create({
        ...createStudentDto,
        _id: new mongoose.Types.ObjectId(),
      });
      return createdStudent;
    } catch (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new Error(`Student with id ${id} not found`);
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();
    if (!updatedStudent) {
      throw new Error(`Student with id ${id} not found`);
    }
    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new Error(`Student with id ${id} not found`);
    }
    return deletedStudent;
  }
}