import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import { RoleEnum } from "src/enum/role.enum";

export type LoginDocument = HydratedDocument<Login>
@Schema({ timestamps: true })
export class Login {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    auth: ObjectId;
    @Prop({ type: Boolean, default: true })
    isLoggedIn: boolean;
    @Prop({ type: String, enum: RoleEnum, trim: true })
    role: string;
}
export const LoginSchema = SchemaFactory.createForClass(Login);
export const LoginModel = { name: 'login', schema: LoginSchema };