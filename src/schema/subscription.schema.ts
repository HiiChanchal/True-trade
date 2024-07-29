import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Base } from './base.schema';
import { SubscriptionPlanDurationEnum, SubscriptionStatusEnum } from 'src/enum/subscription.enum';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    provider: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    category: ObjectId;
    @Prop({ type: String, enum: SubscriptionStatusEnum, trim: true, default: SubscriptionStatusEnum.ACTIVE })
    status: String;
    @Prop({ type: Date, required: true })
    startDate: Date;
    @Prop({ type: Date, required: true })
    endDate: Date;
    @Prop({ type: Number })
    amount: number;
    @Prop({ type: String, enum: SubscriptionPlanDurationEnum, trim: true })
    duration: String;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
export const SubscriptionModel = { name: 'subscription', schema: SubscriptionSchema };