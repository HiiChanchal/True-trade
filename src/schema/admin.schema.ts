import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import { Base } from "./base.schema";
import { AccessEnum } from "src/enum/access.enum";


export type AdminDocument = HydratedDocument<Admin>
@Schema({ timestamps: true })
export class Admin extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: String, required: true })
    firstName: string;
    @Prop({ type: String, default: "" })
    lastName: string;
    @Prop({ type: String, required: true, lowercase: true, trim: true, unique: true })
    email: string;
    @Prop({ type: String, default: null })
    image: string;
    @Prop({ type: [String], enum: AccessEnum, default: [] })
    access: string[];
}
export const AdminSchema = SchemaFactory.createForClass(Admin);
export const AdminModel = { name: 'admin', schema: AdminSchema };