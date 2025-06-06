import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArchivedPaymentsService } from './archived-payments.service';
import { ArchivedPaymentsController } from './archived-payments.controller';
import { ArchivedPayment, ArchivedPaymentSchema } from './entities/archived-payment.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArchivedPayment.name, schema: ArchivedPaymentSchema }
    ]),
    JwtModule
  ],
  controllers: [ArchivedPaymentsController],
  providers: [ArchivedPaymentsService],
  exports: [ArchivedPaymentsService]
})
export class ArchivedPaymentsModule {}
