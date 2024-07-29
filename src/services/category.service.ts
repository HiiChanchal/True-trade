import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { CategoryDto } from "src/dto/category.dto";
import { SuccessResponse } from "src/model/success.model";
import { PipelineService } from "./static/pipeline.service";
import { CategoryDocument, CategoryModel } from "src/Schema/category.schema";
import { IUser } from "src/interface/user.interface";
import { RoleEnum } from "src/enum/role.enum";
import { SupportCategoryDocument, SupportCategoryModel } from "src/Schema/support-category.schema";

@Injectable()
export class CategoryService {
    constructor(@InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(SupportCategoryModel.name) private supportCategoryModel: Model<SupportCategoryDocument>) { }

    async create(categoryDto: CategoryDto, user: IUser) {
        const _doc = await new this.categoryModel({ ...categoryDto }).save();
        return new SuccessResponse('Category Created Successfully', _doc)
    }


    async update(id: any, updateCategoryDto: CategoryDto, user: IUser) {
        const _doc = await this.categoryModel.findByIdAndUpdate(id, { $set: { ...updateCategoryDto } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse('Category Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }

    async getAllAdmin(user: IUser) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.lookup('signals', '_id', 'category', 'signal', [
            PipelineService.group({
                _id: "$category",
                count: { $sum: 1 }
            })
        ]));
        query.push(PipelineService.project({ name: 1, description: 1, createdAt: 1, updatedAt: 1, signal: { $first: "$signal.count" } }));
        const _doc = await this.categoryModel.aggregate(query).exec();
        return new SuccessResponse('Category fetch successfully.', _doc)
    }

    async getAll(user: IUser) {
        let query: PipelineStage[] = [];
        if (user.role == RoleEnum.PROVIDER) {
            query.push(PipelineService.lookup('subscription-plans', '_id', 'category', 'plans', [PipelineService.match({ auth: new Types.ObjectId(user.authId) })]));
            query.push(PipelineService.project({ name: 1, description: 1, plan: { $first: "$plans" } }));
        }
        else {
            query.push(PipelineService.project({ name: 1, description: 1 }));
        }
        const _doc = await this.categoryModel.aggregate(query).exec();
        return new SuccessResponse('Category fetch successfully.', _doc)
    }
    async getById(id: any, user: IUser) {
        const _doc = await this.categoryModel.findById(id).exec();
        return new SuccessResponse('Category fetch successfully.', _doc)
    }

    async createSupportCategory(categoryDto: CategoryDto, user: IUser) {
        const _doc = await new this.supportCategoryModel({ ...categoryDto }).save();
        return new SuccessResponse('Support Category Created Successfully', _doc)
    }


    async updateSupportCategory(id: any, updateCategoryDto: CategoryDto, user: IUser) {
        const _doc = await this.supportCategoryModel.findByIdAndUpdate(id, { $set: { ...updateCategoryDto } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse('Support Category Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }

    async getAllSupportCategoryAdmin(user: IUser) {
        const _doc = await this.supportCategoryModel.find().exec();
        return new SuccessResponse('Support category fetch successfully.', _doc)
    }

    async getAllSupportCategory(user: IUser) {
        const _doc = await this.supportCategoryModel.find({ active: true }).exec();
        return new SuccessResponse('Support category fetch successfully.', _doc)
    }
    async getSupportCategoryById(id: any, user: IUser) {
        const _doc = await this.supportCategoryModel.findById(id).exec();
        return new SuccessResponse('Support category fetch successfully.', _doc)
    }
    async deleteSupportCategory(id: any, user: IUser) {
        const _doc = await this.supportCategoryModel.findByIdAndDelete(id).exec();
        if (_doc) {
            return new SuccessResponse('Support category deleted successfully.', _doc);
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }

}