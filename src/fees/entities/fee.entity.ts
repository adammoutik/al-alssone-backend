import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";


enum FeeType {
    insurance = 'insurance',
    registration = 'registration',
    childcare = 'childcare',
    education = 'education'
}
enum FeeCategory {
    maternelle = 'maternelle',
    primaire = 'primaire'
}

@Schema({timestamps: true})
export class Fee {
    /*
    {
  _id: ObjectId,
  type: "insurance" | "registration" | "childcare" | "education",
  category: "maternelle" | "primaire",
  amount: number,
  createdAt: Date
}
    */
    @Prop({type: SchemaTypes.ObjectId, required: true })
    _id: string; // ObjectId

    @Prop({type: String, enum: FeeType, required: true })
    type: FeeType; // insurance | registration | childcare | education

    @Prop({type: String, enum: FeeCategory, required: true })
    category: FeeCategory; // maternelle | primaire

    @Prop({type: Number, required: true })
    amount: number; 
}


export const FeeSchema = SchemaFactory.createForClass(Fee);

