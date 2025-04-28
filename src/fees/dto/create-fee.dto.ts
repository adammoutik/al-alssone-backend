import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { FeeType } from '../entities/fee.entity';

export class CreateFeeDto {
  @ApiProperty({
    example: 'education',
    enum: FeeType,
    description: 'Type of fee',
  })
  @IsEnum(FeeType)
  type: FeeType;

  @ApiProperty({
    example: 'primaire',
    enum: ['maternelle', 'primaire'],
    description: 'Category (maternelle/primaire)',
  })
  @IsEnum(['maternelle', 'primaire'])
  category: string;

  @ApiProperty({
    example: 'Annual registration fee',
    description: 'Description of the fee',
  })
  @IsOptional()
  Description: string;


  @ApiProperty({ example: 500, description: 'Amount in local currency' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: true, description: 'Is fee active?', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}