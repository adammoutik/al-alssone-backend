import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentSchema } from './entities/student.entity';

@Module({
  imports: [MongooseModule.forFeature([{name:'Student', schema: StudentSchema}])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
