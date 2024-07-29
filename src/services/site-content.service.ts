import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SiteContent, SiteContentDocument, SiteContentModel } from "src/Schema/site-content.schema";
import { SiteContentDto } from "src/dto/site-content.dto";
import { IUser } from "src/interface/user.interface";
import { SuccessResponse } from "src/model/success.model";


@Injectable()
export class SiteContentService {
    constructor(@InjectModel(SiteContentModel.name) private siteContentModel: Model<SiteContentDocument>) { }

    async create(siteContentDto: SiteContentDto, user: IUser) {
        let _doc = await this.siteContentModel.findOne({ type: siteContentDto.type }).exec();
        if (_doc) {
            throw new BadRequestException("Resource you are trying to add already exist.");
        }
        _doc = await new this.siteContentModel({ ...siteContentDto, createdBy: user.authId }).save();
        return new SuccessResponse("Profile image updated successfully.", _doc);
    }
    async update(id: any, siteContentDto: SiteContentDto, user: IUser) {
        const _doc: SiteContent = await this.siteContentModel.findByIdAndUpdate(id, { $set: { ...siteContentDto, updatedBy: user.authId } }, { runValidators: true, new: true }).exec();
        if (_doc) {
            return new SuccessResponse("Resource you are trying to update successfully.", _doc);
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, user: IUser) {
        const _doc: any = await this.siteContentModel.findByIdAndDelete(id).exec();
        if (_doc) {
            return new SuccessResponse("Resource you are trying to delete successfully.");
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async getAll() {
        let _data = await this.siteContentModel.find({ active: true }).exec();
        return new SuccessResponse("Data fetch successfully.", _data);
    }
    async getById(id: any) {
        let _data = await this.siteContentModel.findById(id).exec();
        return new SuccessResponse("Data fetch successfully.", _data);
    }
    async getByType(type: String) {
        let _data = await this.siteContentModel.findOne({ type: type }).exec();
        return new SuccessResponse("Data fetch successfully.", _data);
    }
}