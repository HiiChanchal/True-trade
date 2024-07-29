import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import { Base } from "./base.schema";
import { ProfileStatusEnum } from "src/enum/role.enum";


export type UserDocument = HydratedDocument<User>
@Schema({ timestamps: true })
export class User extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: String, default: "", lowercase: true })
    username: string;
    @Prop({ type: String, default: "" })
    firstName: string;
    @Prop({ type: String, default: "" })
    lastName: string;
    @Prop({ type: String, required: true, lowercase: true, trim: true, unique: true })
    email: string;
    @Prop({ type: String, default: null })
    image: string;
    @Prop({ type: Number, default: 0 })
    traderWallet: number;
    @Prop({ type: Number, default: 0 })
    providerWallet: number;
    @Prop({ type: String, default: null })
    selfie: string;
    @Prop({ type: String, enum: ProfileStatusEnum, trim: true, default: ProfileStatusEnum.PENDING })
    status: string;
    @Prop({ type: String, default: null })
    reason: string;
    @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
    traderInterest: ObjectId[];
    @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
    providerInterest: ObjectId[];
    @Prop({ type: Number, default: 0 })
    withdraw: number;
    @Prop({ type: String, default: null })
    customerId: string;
    @Prop({ type: String, default: null })
    accountId: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = { name: 'user', schema: UserSchema };