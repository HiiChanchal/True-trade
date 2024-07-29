import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Base } from "./base.schema";
import { RoleEnum } from "src/enum/role.enum";

export type AuthDocument = HydratedDocument<Auth>

class Device {
    @Prop({ type: String, required: true })
    id: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true })
    token: string;
    @Prop({ type: String, required: true })
    platform: string;
    @Prop({ type: String, default: null })
    model: string;
}

@Schema({ timestamps: true })
export class Auth extends Base {
    @Prop({ type: String, required: true, lowercase: true, trim: true, index: true, unique: true })
    username: string;
    @Prop({ type: String, trim: true })
    password: string;
    @Prop({ type: String, enum: RoleEnum, trim: true, default: RoleEnum.TRADER })
    role: string;
    @Prop({ type: Boolean, default: false })
    verify: boolean;
    @Prop({ type: String, required: false })
    code: string;
    @Prop({ type: Date, required: false })
    expiry: Date;
    @Prop({ type: Device })
    device: Device;
    @Prop({ type: Boolean, default: false })
    providerAlso: boolean;
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
export const AuthModel = { name: 'auth', schema: AuthSchema };