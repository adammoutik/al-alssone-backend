import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types, Document } from "mongoose";




@Schema({timestamps: true})
export class Family {

    // @Prop({type:SchemaTypes.ObjectId })
    // _id: string;

    @Prop({ required: true })
  familyName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  children: Types.ObjectId[];

  @Prop({ default: false })
  IsEligible: boolean;

  @Prop({ default: 20 })
  discountPercentage: number;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: false })
  discountChild?: Types.ObjectId; //marks which child is eligible for discount

}


export interface FamilyDocument extends Family, Document {}

export const FamilySchema = SchemaFactory.createForClass(Family);
