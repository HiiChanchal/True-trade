import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { InquiryStatusEnum, InquiryTypeEnum } from 'src/enum/inquiry.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { Base } from './base.schema';

export type InquiryDocument = HydratedDocument<Inquiry>;

@Schema({ timestamps: true })
class InquiryThread {
    @Prop({ type: String, trim: true, required: true })
    text: String;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    from: ObjectId;
    @Prop({ type: String, enum: Object.values(RoleEnum), trim: true, required: true })
    role: string;
}
const InquiryThreadSchema = SchemaFactory.createForClass(InquiryThread);
@Schema({ timestamps: true })
export class Inquiry extends Base {
    @Prop({ type: String, trim: true, required: true })
    title: String;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: String, trim: true, required: true })
    type: String;
    @Prop({ type: String, enum: Object.values(InquiryStatusEnum), default: InquiryStatusEnum.OPEN, trim: true, required: true })
    status: String;
    @Prop({ type: [InquiryThreadSchema], default: [] })
    thread: InquiryThread[];
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);
export const InquiryModel = { name: 'inquiry', schema: InquirySchema };