import { IsString, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../payments/entities/payment.entity';

export class CreateArchivedPaymentDto {
  @ApiProperty()
  @IsString()
  originalPaymentId: string;

  @ApiProperty()
  @IsString()
  studentId: string;

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
