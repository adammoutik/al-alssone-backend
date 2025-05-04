import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export enum FeeType {
    insurance = 'insurance',
    registration = 'registration',
    childcare = 'childcare',
    education = 'education',
    transport = 'transport'
}
export enum FeeCategory {
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
    // @Prop({type: SchemaTypes.ObjectId })
    // _id: string; // ObjectId

    @Prop({type: String, enum: FeeType, required: true })
    type: FeeType; // insurance | registration | childcare | education

    @Prop({type: String, enum: FeeCategory, required: true })
    category: FeeCategory; // maternelle | primaire

    @Prop({type:String, required: false })
    description: string;

    @Prop({type: Number, required: true })
    amount: number;

    @Prop({type: Boolean, default: false })
    isActive: boolean; 

    @Prop({type: String, default:'Monthly'})
    frequency:String;
}


export const FeeSchema = SchemaFactory.createForClass(Fee);

