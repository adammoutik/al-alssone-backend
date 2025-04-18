import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";




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
   @Prop({type: SchemaTypes.ObjectId, required: true })
    _id: string; // ObjectId

    @Prop({type: SchemaTypes.ObjectId, required: true })
    studentId: string; // Reference to students

    @Prop({type: SchemaTypes.ObjectId, required: true })
    feeId: string; // Reference to fees

    @Prop({type: Number, required: true })
    amountPaid: number; // Amount paid

    @Prop({type: Boolean, required: true })
    discountApplied: boolean; // Discount applied

    @Prop({type: String, required: true })
    period: string; // "YYYY" (insurance) or "YYYY-MM" (monthly)

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
