import { Prop } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";

export class Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    createdBy: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId })
    updatedBy: ObjectId;
    @Prop({ type: Date })
    createdAt: Date;
    @Prop({ type: Date })
    updatedAt: Date;
    @Prop({ type: Boolean, default: true })
    active: boolean;
}