import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { Schema } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeSchema } from './entities/fee.entity';

@Module({
  imports:[MongooseModule.forFeature([
    { name: 'Fee', schema: FeeSchema }])],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
