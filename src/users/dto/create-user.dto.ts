import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
export class CreateUserDto {    
    @IsOptional()
  @IsString()
  readonly _id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'user12' })
  @IsString()
  readonly username: string;

  @ApiProperty({ example: 'strong_password123' })
  @IsString()
   password: string;

  @ApiProperty({ enum: UserRole, example: 'admin' })
  @IsEnum(UserRole)
  readonly role: UserRole;

  @ApiProperty({ example: 212612345678 })
  @IsNumber()
  readonly phoneNumber: number;

  @ApiProperty({ example: 'John' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  readonly lastName: string;
}
