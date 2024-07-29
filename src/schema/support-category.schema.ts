import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Base } from "./base.schema";

export type SupportCategoryDocument = HydratedDocument<SupportCategory>

@Schema({ timestamps: true })
export class SupportCategory extends Base {
    @Prop({ type: String, required: true, unique: true })
    name: string;
    @Prop({ type: String, default: null })
    description: string;
}

export const SupportCategorySchema = SchemaFactory.createForClass(SupportCategory)
export const SupportCategoryModel = { name: 'suppport-category', schema: SupportCategorySchema }