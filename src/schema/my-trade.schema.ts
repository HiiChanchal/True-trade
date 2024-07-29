import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type MyTradeDocument = HydratedDocument<MyTrade>;
@Schema({ timestamps: true })
export class MyTrade {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    auth: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    signal: ObjectId;
}

export const MyTradeSchema = SchemaFactory.createForClass(MyTrade);
export const MyTradeModel = { name: 'my-trade', schema: MyTradeSchema };