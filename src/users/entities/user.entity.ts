import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export enum UserRole {
    ADMIN = 'admin',
    ASSISTANT = 'assistant',
}

@Schema({timestamps: true})
export class User {
    /*
    {
  _id: ObjectId,
  email: string, // unique
  password: string, // hashed
  role: "admin" | "assistant",
  phoneNumber: number,
  firstName: string,
  lastName: string,
  createdAt: Date
}
    */


//    @Prop({type: String })
//     _id: string; // ObjectId

    @Prop({type: String, required: true ,unique: true })
    email: string; // unique email address of the user

    @Prop({type: String, required: true ,unique: true })
    username: string; // unique email address of the user

    @Prop({type: String, required: true })
    password: string; // hashed password of the user

    @Prop({type: String, enum: UserRole, required: true })
    role: string; // role of the user (admin or assistant)

    @Prop({type: Number, required: true })
    phoneNumber: number; // phone number of the user

    @Prop({type: String, required: true })
    firstName: string; // first name of the user

    @Prop({type: String, required: true })
    lastName: string; // last name of the user


}


export const UserSchema = SchemaFactory.createForClass(User);
