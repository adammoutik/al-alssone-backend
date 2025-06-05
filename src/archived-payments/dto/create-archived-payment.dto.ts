import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../payments/entities/payment.entity';
import { Types } from 'mongoose';

export class CreateArchivedPaymentDto {
  @ApiProperty()
  @IsString()
  originalPaymentId: string;

  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ type: [Types.ObjectId] })
  feeId: Types.ObjectId[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  familyId?: string;

  @ApiProperty()
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  discountApplied?: boolean;

  @ApiProperty()
  @IsString()
  period: string;

  @ApiProperty({ enum: PaymentStatus })
  @IsString()
  status: PaymentStatus;

  @ApiProperty()
  @IsDate()
  archivedAt: Date;
}
