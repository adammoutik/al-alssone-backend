import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, SchemaTypes, Types } from "mongoose";
import { PaymentStatus } from "../../payments/entities/payment.entity";

@Schema({
  timestamps: true,
})
export class ArchivedPayment {
  @Prop({type: SchemaTypes.ObjectId, required: true })
  originalPaymentId: string; // Reference to the original payment

  @Prop({type: SchemaTypes.ObjectId, required: true })
  studentId: string;

  @Prop({type: [SchemaTypes.ObjectId], ref:'Fee', required: true })
  feeId: Types.ObjectId[];

  @Prop({type: SchemaTypes.ObjectId, ref:'Family', required: false })
  familyId: Types.ObjectId;

  @Prop({type: Number, required: true })
  amountPaid: number;

  @Prop({type: Boolean, required: false })
  discountApplied: boolean;

  @Prop({type: String, required: true })
  period: string;

  @Prop({type: String, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop({type: Date, required: true })
  archivedAt: Date;

  @Prop({type: Date})
  createdAt: Date;
}

export const ArchivedPaymentSchema = SchemaFactory.createForClass(ArchivedPayment);
