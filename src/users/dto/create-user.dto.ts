import { IsBoolean, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";
import { UserRole } from "../entities/user.entity";


export class CreateUserDto {

    @IsOptional()
    readonly _id: string;
  
    @IsString()
    readonly firstName: string;
  
    @IsString()
    readonly lastName: string;
  
    @IsEmail()
    readonly email: string;
  
    @IsStrongPassword()
    password: string;
  
    @IsPhoneNumber()
    readonly phoneNumber: string;
  
    @IsEnum(UserRole)
    readonly role : UserRole;
  }
  