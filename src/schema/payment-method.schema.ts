import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Base } from './base.schema';
import { PaymentMethodTypeEnum } from 'src/enum/payment-method.enum';
import { RoleEnum } from 'src/enum/role.enum';

export type PaymentMethodDocument = HydratedDocument<PaymentMethod>;

@Schema({ timestamps: true })
export class PaymentMethod extends Base {
    @Prop({ type: String, required: true, trim: true })
    title: string;
    @Prop({ type: String })
    image: string;
    @Prop({ type: String, enum: PaymentMethodTypeEnum, trim: true, required: true })
    type: String;
    @Prop({ type: String })
    upiId: String;
    @Prop({ type: String })
    accountHolderName: String;
    @Prop({ type: String })
    bankName: String;
    @Prop({ type: String })
    accountNumber: String;
    @Prop({ type: String })
    ifscCode: String;
    @Prop({ type: String })
    countryCode: String;
    @Prop({ type: String })
    phoneNumber: String;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: String, enum: RoleEnum, trim: true, default: RoleEnum.ADMIN })
    role: string;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);

export const PaymentMethodModel = { schema: PaymentMethodSchema, name: 'payment-method' };