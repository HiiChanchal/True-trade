import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { TransactionForTypeEnum, TransactionStatusEnum, TransactionTypeEnum } from 'src/enum/transaction.enum';
import { Base } from './base.schema';
import { RoleEnum } from 'src/enum/role.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auths' })
    auth: ObjectId;
    @Prop({ type: String, required: true, enum: RoleEnum, trim: true })
    role: string;
    @Prop({ type: Number, required: true })
    amount: number;
    @Prop({ type: Number, default: 0 })
    commission: number;
    @Prop({ type: Number, default: 0 })
    charge: number;
    @Prop({ type: String, enum: TransactionTypeEnum, trim: true, required: true })
    type: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null })
    transactionId: ObjectId;
    @Prop({ type: String, default: null })
    paymentId: string;
    @Prop({ type: String, default: null })
    paymentTransactionId: string;
    @Prop({ type: String, enum: TransactionForTypeEnum, required: true, trim: true })
    for: string;
    @Prop({ type: String, enum: TransactionStatusEnum, required: true, trim: true, default: TransactionStatusEnum.INITIATED })
    status: string;
    @Prop({ type: Object, trim: true, default: null })
    data: Object;
    @Prop({ type: String, default: null })
    file: string;
    @Prop({ type: String, default: null })
    remark: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
export const TransactionModel = { name: 'transaction', schema: TransactionSchema };