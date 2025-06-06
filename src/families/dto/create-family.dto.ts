import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEmail } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    example: 'Smith Family',
    description: 'Family name',
    required: true,
  })
  @IsString()
  familyName: string;

  @ApiProperty({
    example: 'smith@example.com',
    description: 'Family email address',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: ['65a8d7f31c1d9b2a9c4d5e6f'],
    description: 'Array of student IDs (optional)',
    required: false,
  })
  @IsArray()
  members: string[];

  @ApiProperty({
    example: '65a8d7f31c1d9b2a9c4d5e6f',
    description: 'Student ID of the child eligible for discount',
    required: false,
  })
  @IsString()
  @IsOptional()
  discountChild?: string;
}