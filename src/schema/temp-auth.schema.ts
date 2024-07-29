import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TempAuthDocument = HydratedDocument<TempAuth>

@Schema({ timestamps: true })
export class TempAuth {
    @Prop({ type: String, required: true, lowercase: true, trim: true })
    username: string;
    @Prop({ type: Boolean, default: false })
    verify: boolean;
    @Prop({ type: String, required: false })
    code: string;
    @Prop({ type: Date, required: false })
    expiry: Date;
}
export const TempAuthSchema = SchemaFactory.createForClass(TempAuth);
export const TempAuthModel = { name: 'temp-auth', schema: TempAuthSchema };