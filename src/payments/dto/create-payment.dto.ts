import { Type } from "class-transformer";
import { IsString, IsOptional, IsArray, IsNumber, IsDate, IsEnum, IsBoolean, isDate, isString } from "class-validator";
import { Types } from "mongoose";
import { PaymentStatus } from "../entities/payment.entity";

export class CreatePaymentDto {
    @IsString()
    studentId: string;
  
    @IsString()
    @IsOptional()
    familyId?: string;
  
    @IsArray()
    feeId: Types.ObjectId[];
  
    @IsNumber()
    amountPaid: number;
  
    
  
    @IsString()
    @IsOptional()
    paymentMethod?: string;
  
    @IsEnum(PaymentStatus)
    @IsOptional()
    status?: PaymentStatus;
  
    
    @IsBoolean()
    @IsOptional()
    discountApplied?: boolean;
  
    @IsNumber()
    @IsOptional()
    discountAmount?: number;

    @IsString()
    @IsOptional()
    period?: String; // "YYYY" (insurance) or "YYYY-MM" (monthly)

    //createAt
    createdAt: Date;
  } 