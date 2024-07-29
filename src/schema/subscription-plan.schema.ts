import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Base } from './base.schema';

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>;

@Schema({ timestamps: true })
export class SubscriptionPlan extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'categories' })
    category: ObjectId;
    @Prop({ type: Number })
    monthly: number;
    @Prop({ type: Number })
    quarterly: number;
    @Prop({ type: Number })
    halfYearly: number;
    @Prop({ type: Number })
    yearly: number;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
export const SubscriptionPlanModel = { name: 'subscription-plan', schema: SubscriptionPlanSchema };