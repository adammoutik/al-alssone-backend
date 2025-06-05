import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArchivedPaymentsService } from './archived-payments.service';
import { ArchivedPaymentsController } from './archived-payments.controller';
import { ArchivedPayment, ArchivedPaymentSchema } from './entities/archived-payment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArchivedPayment.name, schema: ArchivedPaymentSchema }
    ])
  ],
  controllers: [ArchivedPaymentsController],
  providers: [ArchivedPaymentsService],
  exports: [ArchivedPaymentsService]
})
export class ArchivedPaymentsModule {}
