import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { Mongoose } from 'mongoose';
import { FamilySchema } from './entities/family.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentSchema } from 'src/students/entities/student.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Family', schema: FamilySchema },
    { name: 'Student', schema: StudentSchema } ])],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService]
})
export class FamiliesModule {}
