import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AvatarDocument = HydratedDocument<Avatar>

@Schema({ timestamps: true })
export class Avatar {
    @Prop({ type: String, required: true })
    name: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar)
export const AvatarModel = { name: 'avatar', schema: AvatarSchema }