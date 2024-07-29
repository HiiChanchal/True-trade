import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "src/services/category.service";
import { MongooseModule } from "@nestjs/mongoose";
import { CATEGORY_SCHEMA, SUPPORT_CATEGORY_SCHEMA } from "src/Schema";

@Module({
    imports: [MongooseModule.forFeature([CATEGORY_SCHEMA, SUPPORT_CATEGORY_SCHEMA])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: []
})
export class AppCategoryModule { }