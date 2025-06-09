import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student, StudentSchema } from './entities/student.entity';
import { StudentCodeService } from './services/student-code.service';
import { PublicStudentController } from './controllers/public-student.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
  ],
  controllers: [StudentsController, PublicStudentController],
  providers: [StudentsService, StudentCodeService],
  exports: [StudentsService, StudentCodeService],
})
export class StudentsModule {}
