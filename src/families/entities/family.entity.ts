import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaType, SchemaTypes } from "mongoose";




@Schema({timestamps: true})
export class Family {

    // @Prop({type:SchemaTypes.ObjectId })
    // _id: string;

    // members array of studens ids maximum 2
    @Prop({type: [SchemaTypes.ObjectId], ref: 'Student', required: true })
    members: string[];

}


export const FamilySchema = SchemaFactory.createForClass(Family);
