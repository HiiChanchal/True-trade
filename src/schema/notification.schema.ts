import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { RoleEnum } from "src/enum/role.enum";

export type NotificationDocument = HydratedDocument<Notification>

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    auth: ObjectId;
    @Prop({ type: String, enum: RoleEnum, trim: true })
    role: string;
    @Prop({ type: String, enum: NotificationTypeEnum, trim: true, default: NotificationTypeEnum.OTHERS })
    type: string;
    @Prop({ type: String, default: null })
    image: string;
    @Prop({ type: String, required: true })
    text: string;
    @Prop({ type: Object, default: null })
    data: Object;
    @Prop({ type: Boolean, default: false })
    read: boolean;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationModel = { name: 'notification', schema: NotificationSchema };