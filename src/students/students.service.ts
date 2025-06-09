import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentCodeService } from './services/student-code.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: mongoose.Model<Student>,
    private readonly studentCodeService: StudentCodeService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const studentCode = await this.studentCodeService.generateUniqueStudentCode();
    const createdStudent = new this.studentModel({
      ...createStudentDto,
      studentCode,
    });
    return createdStudent.save();
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

  async findByFamily(familyId: string): Promise<Student[]> {
    return this.studentModel.find({ familyId }).exec();
  }
}