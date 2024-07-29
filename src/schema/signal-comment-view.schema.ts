import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type SignalCommentViewDocument = HydratedDocument<SignalCommentView>;
@Schema({ timestamps: true })
export class SignalCommentView {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    auth: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    signal: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    comment: ObjectId;
}

export const SignalCommentViewSchema = SchemaFactory.createForClass(SignalCommentView);
export const SignalCommentViewModel = { name: 'signal-comment-view', schema: SignalCommentViewSchema };