import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Base } from "./base.schema";

export type CategoryDocument = HydratedDocument<Category>

@Schema({timestamps:true})
export class Category extends Base {
    @Prop({type:String,required:true,unique:true})
    name: string;
    @Prop({type:String,default:null})
    description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category)
export const CategoryModel = {name:'category',schema:CategorySchema}