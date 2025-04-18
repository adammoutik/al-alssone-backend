import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Token extends Document {
  @Prop()
  token: string;

  @Prop()
  user_id: string;

  @Prop()
  type: string;

  @Prop()
  expires_at: string;
  
}
export const TokenSchema = SchemaFactory.createForClass(Token);
