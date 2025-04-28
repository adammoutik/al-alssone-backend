import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema({
  timestamps: true})
export class Student {

/*
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  birthDate: Date,
  category: "maternelle" | "primaire",
  niveau: string, // e.g., "Petite Section"
  registrationDate: Date,
  familyId: ObjectId, // Reference to families
  staysAfter12h: boolean,
  createdAt: Date
}
*/

// @Prop({type: Types.ObjectId })
// _id: string; // ObjectId


@Prop({type: String, required: true })
firstName: string; // First name of the student

@Prop({type: String, required: true })
lastName: string; // Last name of the student

@Prop({type: Date, required: true })
birthDate: Date; // Birth date of the student

@Prop({type: String, enum: ['maternelle', 'primaire'], required: true })
category: string; // Category of the student (maternelle or primaire)

@Prop({type: String, required: true })
niveau: string; // Level of the student (e.g., "Petite Section")

@Prop({type: Date, required: true })
registrationDate: Date; // Registration date of the student

@Prop({ type: Types.ObjectId, ref: 'Family' })
familyId?: string; // Reference to familie

@Prop({type: Boolean, required: true,default:false })
isGarde: boolean; // Indicates if the student stays after 12h

@Prop({type: Number, required: true })
parentPhoneNumber: number; // Parent's phone number



@Prop({type: Boolean, default: true })
isActive?: boolean; 


}


export const StudentSchema = SchemaFactory.createForClass(Student);
