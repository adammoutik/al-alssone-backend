import { 
    IsDate, 
    IsBoolean, 
    IsOptional, 
    IsIn, 
    IsString,
    IsNotEmpty 
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export class CreateStudentDto {
    
  @IsString()
  @IsOptional()
  readonly _id: string;

    @ApiProperty({
      example: 'Jean',
      description: 'Student first name'
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @ApiProperty({
      example: 'Dupont',
      description: 'Student last name'
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;
  
    @ApiProperty({
      example: '2018-03-15',
      description: 'Date of birth (YYYY-MM-DD)'
    })
    @IsDate()
    birthDate: Date;
  
    @ApiProperty({
      example: 'primaire',
      description: 'Education category',
      enum: ['maternelle', 'primaire']
    })
    @IsIn(['maternelle', 'primaire'])
    category: string;
  
    @ApiProperty({
      example: 'PA',
      description: 'Education level',
    //   examples: ['Petite Section', 'Moyenne Section', 'CP', 'CE1']
    })
    @IsString()
    niveau: string;
  
    @ApiPropertyOptional({
      example: '507f1f77bcf86cd799439011',
      description: 'Optional family ID reference'
    })
    @IsOptional()
    familyId?: string;
  
    @ApiPropertyOptional({
      example: true,
      description: 'Whether student stays after 12h for childcare',
      default: false
    })
    @IsBoolean()
    @IsOptional()
    isGarde?: boolean;
  
    @ApiPropertyOptional({
      example: false,
      description: 'Whether student uses school transport',
      default: false
    })
    @IsBoolean()
    @IsOptional()
    usesTransport?: boolean;
  
    @ApiProperty({
      example: '2024-09-01',
      description: 'Date of registration (YYYY-MM-DD)'
    })
    @IsDate()
    registrationDate: Date;

    //parentPhoneNumber
    @ApiProperty({
      example: 212612345678,
      description: 'Parent phone number'
    })
    @IsString()
    @IsNotEmpty()
    parentPhoneNumber: string;
  }