import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeSchema } from 'src/fees/entities/fee.entity';

@Module({
  imports: [MongooseModule.forFeature([
      { name: 'Fee', schema: FeeSchema }])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
