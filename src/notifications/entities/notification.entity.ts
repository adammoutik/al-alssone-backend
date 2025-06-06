import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Payment' })
  paymentId: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Family' })
  familyId: string;

  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ type: Date, required: true })
  scheduledFor: Date;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Number, required: true })
  daysBeforeDue: number;

  @Prop({ type: Date })
  sentAt: Date;

  @Prop({ type: String })
  errorMessage?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 