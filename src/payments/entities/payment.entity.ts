import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";


export enum PaymentStatus{
    paid = 'paid',
    unpaid = 'unpaid'
}



@Schema({
  timestamps: true,})
export class Payment {
    /* 
  {
  _id: ObjectId,
  studentId: ObjectId, // Reference to students
  feeId: ObjectId, // Reference to fees
  amountPaid: number,
  discountApplied: boolean,
  period: string, // "YYYY" (insurance) or "YYYY-MM" (monthly)
  createdAt: Date
}
    */
  //  @Prop({type: SchemaTypes.ObjectId, required: true })
  //   _id: string; // ObjectId

    @Prop({type: SchemaTypes.ObjectId, required: true })
    studentId: string; // Reference to students

    @Prop({type: [SchemaTypes.ObjectId],ref:'Fee', required: true })
    feeId: Types.ObjectId[]; // Reference to table of fees

    @Prop({type: SchemaTypes.ObjectId,ref:'Family', required: false })
    familyId: Types.ObjectId; // Reference to families

    @Prop({type: Number, required: true })
    amountPaid: number; // Amount paid

    @Prop({type: Boolean, required: false })
    discountApplied: boolean; // Discount applied

    @Prop({type: String, required: true })
    period: string; // "YYYY" (insurance) or "YYYY-MM" (monthly)

    //status: 'paid' | 'unpaid'; // Status of the payment (paid or unpaid)
    @Prop({type: String, enum: PaymentStatus, default: PaymentStatus.unpaid })
    status: PaymentStatus; // Status of the payment (paid or unpaid)    

    @Prop({type:Date})
    createdAt: Date;


}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
