import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateFamilyDto {
  


  @ApiProperty({
    example: ['65a8d7f31c1d9b2a9c4d5e6f'],
    description: 'Array of student IDs (optional)',
    required: false,
  })
  @IsArray()
  members: string[];
}