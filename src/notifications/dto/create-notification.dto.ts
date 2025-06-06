import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsMongoId, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the payment this notification is for',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  paymentId: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the family this notification is for',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId()
  familyId: Types.ObjectId;

  @ApiProperty({
    description: 'When the notification should be sent',
    example: '2024-03-15T09:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  scheduledFor: Date;

  @ApiProperty({
    description: 'Subject of the notification email',
    example: 'Payment Reminder: 3 days until due'
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Message content of the notification',
    example: 'This is a reminder that your payment is due in 3 days.'
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Number of days before the payment is due',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  daysBeforeDue: number;
} 