import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, SchemaTypes, Types } from "mongoose";
import { PaymentStatus } from "../../payments/entities/payment.entity";

@Schema({
  timestamps: true,
})
export class ArchivedPayment {
  @Prop({type: SchemaTypes.ObjectId, required: true, ref: 'Payment' })
  originalPaymentId: string; // Reference to the original payment

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
