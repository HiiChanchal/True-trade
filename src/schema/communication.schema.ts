import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CommunicationCategoryEnum, CommunicationTypeEnum, PlatformEnum } from "src/enum/common.enum";
import { Base } from "./base.schema";

export type CommunicationDocument = HydratedDocument<Communication>
@Schema({ timestamps: true })
export class Communication extends Base {
    @Prop({ type: String, required: true, enum: CommunicationTypeEnum, trim: true })
    type: string;
    @Prop({ type: [String], default: [] })
    platform: string[];
    @Prop({ type: String, enum: CommunicationCategoryEnum, trim: true, required: false })
    category: string;
    @Prop({ type: [String], default: [] })
    users: string[];
    @Prop({ type: String, required: true })
    title: string;
    @Prop({ type: String, required: true })
    body: string;
    @Prop({ type: Number, default: 0 })
    click: number;
}
export const CommunicationSchema = SchemaFactory.createForClass(Communication);
export const CommunicationModel = { name: 'communication', schema: CommunicationSchema };