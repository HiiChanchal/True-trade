import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SiteContentEnum } from 'src/enum/common.enum';
import { Base } from './base.schema';

export type SiteContentDocument = HydratedDocument<SiteContent>;

@Schema({ timestamps: true })
export class SiteContent extends Base {
    @Prop({ type: String, required: true, trim: true })
    title: string;
    @Prop({ type: String, required: true })
    content: string;
    @Prop({ type: String, enum: SiteContentEnum, trim: true, unique: true })
    type: String;
}

export const SiteContentSchema = SchemaFactory.createForClass(SiteContent);

export const SiteContentModel = { schema: SiteContentSchema, name: 'site-content' };