import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeSchema } from 'src/fees/entities/fee.entity';
import { PaymentSchema } from './entities/payment.entity';
import { StudentSchema } from 'src/students/entities/student.entity';
import { FamilySchema } from 'src/families/entities/family.entity';
import { ArchivedPaymentsModule } from '../archived-payments/archived-payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Fee', schema: FeeSchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Student', schema: StudentSchema },
      { name: 'Family', schema: FamilySchema }
    ]),
    ArchivedPaymentsModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
