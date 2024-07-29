import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId, mongo } from 'mongoose';
import { Base } from './base.schema';
import { SignalDurationEnum, SignalStatusEnum, SignalTypeEnum } from 'src/enum/signal.enum';

export type SignalDocument = HydratedDocument<Signal>;

@Schema({ timestamps: true })
class Comment {
    @Prop({ type: String, required: false })
    message: string;
}
const CommentSchema = SchemaFactory.createForClass(Comment);
@Schema({ timestamps: true })
export class Signal extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'categories' })
    category: ObjectId;
    @Prop({ type: String, required: true })
    title: string;
    @Prop({ type: String, enum: SignalTypeEnum, required: true })
    type: string;
    @Prop({ type: String, enum: SignalDurationEnum, required: true })
    duration: string;
    @Prop({ type: Number, required: true })
    entry: number;
    @Prop({ type: Number, required: true })
    stoploss: number;
    @Prop({ type: Number, required: true })
    target: number;
    @Prop({ type: String, enum: SignalStatusEnum, default: SignalStatusEnum.OPEN })
    status: string
    @Prop({ type: [CommentSchema], required: false, default: [] })
    comment: Comment[];
    @Prop({ type: Boolean, default: false })
    targetHit: boolean;
    @Prop({ type: Boolean, default: false })
    stoplossHit: boolean;
}

export const SignalSchema = SchemaFactory.createForClass(Signal);
export const SignalModel = { name: 'signal', schema: SignalSchema };