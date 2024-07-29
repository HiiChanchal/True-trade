import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { AdminDocument, AdminModel } from "src/Schema/admin.schema";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { CategoryDocument, CategoryModel } from "src/Schema/category.schema";
import { PipelineService } from "./static/pipeline.service";
import { RoleEnum } from "src/enum/role.enum";
import { SignalDocument, SignalModel } from "src/Schema/signal.schema";
import { SignalStatusEnum } from "src/enum/signal.enum";
import { OptionalDateRangeDto } from "src/dto/date.dto";
import { AdminSearchSignalDto, SearchSignalDto } from "src/dto/signal.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { PaginationResponse } from "src/model/pagination.model";
import { SearchDto } from "src/dto/search.dto";
import { AvatarDocument, AvatarModel } from "src/Schema/avatar.schema";
import { DownloadService } from "./static/download.service";
@Injectable()
export class AdminService {
    constructor(@InjectModel(AdminModel.name) private adminModel: Model<AdminDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(SignalModel.name) private signalModel: Model<SignalDocument>,
        @InjectModel(AvatarModel.name) private avatarModel: Model<AvatarDocument>) { }

    async image(filename: string, user: IUser) {
        const _doc = await this.adminModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { image: filename } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Profile image updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async avatar(filename: string, user: IUser) {
        const _doc = await new this.avatarModel({ name: filename }).save();
        if (_doc) {
            return new SuccessResponse("Avatar uploaded successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async updateAvatar(id: any, filename: string, user: IUser) {
        const _doc = await this.avatarModel.findByIdAndUpdate(id, { $set: { name: filename } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Avatar updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async deleteAvatar(id: any, user: IUser) {
        const _doc = await this.avatarModel.findByIdAndDelete(id).exec();
        if (_doc) {
            return new SuccessResponse("Avatar deleted successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async getAvatar(user: IUser) {
        const _doc = await this.avatarModel.find({}, { name: 1, url: PipelineService.file('images/profile', '$name') }).exec();
        return new SuccessResponse("Avatar get successfully.", _doc);
    }
    async userStatistics(searchDto: OptionalDateRangeDto, user: IUser) {
        const _res = await this.getUserStatics(searchDto);
        return new SuccessResponse("User statistics fetch successfully.", _res);
    }
    async categoryStatistics(searchDto: OptionalDateRangeDto, user: IUser) {
        let _res: any[] = await this.getCategoryStatics(searchDto);
        return new SuccessResponse("Category statistics fetch successfully.", _res);
    }
    async allSignals(searchDto: AdminSearchSignalDto, user: IUser) {
        let _match: any = {};
        if (searchDto.startDate && searchDto.endDate) {
            _match['$and'] = [{ createdAt: { $lte: searchDto.endDate } }, { createdAt: { $gte: searchDto.startDate } }];
        }
        if (searchDto.category) {
            _match['category'] = new Types.ObjectId(searchDto.category);
        }
        if (searchDto.status) {
            _match['status'] = searchDto.status;
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.lookup('users', 'auth', 'auth', 'provider', [PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]),
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, _id: 0 })]),
                    PipelineService.project({ title: 1, type: 1, duration: 1, entry: 1, stoploss: 1, target: 1, status: 1, targetHit: 1, stoplossHit: 1, active: 1, comment: 1, createdAt: 1, provider: { $first: "$provider" }, category: { $first: "$category" } })
                ],
            },
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        return new SuccessResponse("Signal fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async searchUser(searchDto: SearchDto, user: IUser) {
        if (searchDto.search && searchDto.search.length > 2) {
            let query: PipelineStage[] = [PipelineService.match({ active: true, role: { $in: [RoleEnum.PROVIDER, RoleEnum.TRADER] }, username: { $regex: new RegExp(`${searchDto.search}`, "ig") } })];
            query.push(PipelineService.project({ username: 1, _id: 0 }));
            let _res: any[] = await this.authModel.aggregate(query).exec();
            return new SuccessResponse("User fetch successfully.", _res);
        }
        else {
            return new SuccessResponse("User fetch successfully.", []);
        }
    }
    async downloadStatics(searchDto: OptionalDateRangeDto, user: IUser) {
        const [userStatics, categoryStatics] = await Promise.all([this.getUserStatics(searchDto), this.getCategoryStatics(searchDto)]);
        return DownloadService.statics(userStatics, categoryStatics);
    }
    private async getUserStatics(searchDto: OptionalDateRangeDto) {
        let _match: any = { role: { $in: [RoleEnum.TRADER, RoleEnum.PROVIDER] } };
        if (searchDto.startDate && searchDto.endDate) {
            _match['$and'] = [{ createdAt: { $lte: searchDto.endDate } }, { createdAt: { $gte: searchDto.startDate } }];
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        let _dateDiff = { $dateDiff: { startDate: "$updatedAt", endDate: new Date(), unit: "day" } };
        query.push(PipelineService.group({
            _id: null,
            trader: { $sum: PipelineService.condition({ $and: [{ $eq: ['$role', RoleEnum.TRADER] }, { $not: ['$providerAlso'] }] }, 1, 0) },
            provider: { $sum: PipelineService.condition({ $and: [{ $eq: ['$role', RoleEnum.PROVIDER] }, { $not: ['$providerAlso'] }] }, 1, 0) },
            both: { $sum: PipelineService.condition('$providerAlso', 1, 0) },
            activeTrader: { $sum: PipelineService.condition({ $and: [{ $lte: [_dateDiff, 6] }, { $or: [{ $eq: ['$role', RoleEnum.TRADER] }, '$providerAlso'] }] }, 1, 0) },
            activeProvider: { $sum: PipelineService.condition({ $and: [{ $lte: [_dateDiff, 6] }, { $or: [{ $eq: ['$role', RoleEnum.PROVIDER] }, '$providerAlso'] }] }, 1, 0) },
            daily: { $sum: PipelineService.condition({ $lte: [{ $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "day" } }, 1] }, 1, 0) },
            weekly: { $sum: PipelineService.condition({ $lte: [{ $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "week" } }, 1] }, 1, 0) },
            monthly: { $sum: PipelineService.condition({ $lte: [{ $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "month" } }, 1] }, 1, 0) },
            yearly: { $sum: PipelineService.condition({ $lte: [{ $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "year" } }, 1] }, 1, 0) }
        }));
        query.push(PipelineService.project({ trader: 1, provider: 1, both: 1, activeTrader: 1, activeProvider: 1, daily: 1, weekly: 1, monthly: 1, yearly: 1, total: { $add: ['$trader', '$provider', '$both'] }, _id: 0 }));
        let _res: any[] = await this.authModel.aggregate(query).exec();
        return _res[0];
    }
    private async getCategoryStatics(searchDto: OptionalDateRangeDto) {
        let _date: any[] = [];
        if (searchDto.startDate && searchDto.endDate) {
            _date.push(PipelineService.match({ $and: [{ createdAt: { $lte: searchDto.endDate } }, { createdAt: { $gte: searchDto.startDate } }] }));
        };
        let query: PipelineStage[] = [PipelineService.match({ active: true })];
        query.push(PipelineService.lookup('signals', '_id', 'category', 'signal', [..._date,
        PipelineService.project({ status: 1, targetHit: 1, stoplossHit: 1 }),
        PipelineService.group({
            _id: null,
            // pending: { $sum: PipelineService.condition({ $eq: ['$status', SignalStatusEnum.PENDING] }, 1, 0) },
            open: { $sum: PipelineService.condition({ $eq: ['$status', SignalStatusEnum.OPEN] }, 1, 0) },
            closed: { $sum: PipelineService.condition({ $eq: ['$status', SignalStatusEnum.CLOSED] }, 1, 0) },
            win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
            loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
        }),
        PipelineService.project({ pending: 1, open: 1, closed: 1, win: 1, loss: 1, total: { $add: ['$open', '$closed'] }, _id: 0 })
        ]));
        query.push(PipelineService.project({ name: 1, description: 1, signal: { $first: '$signal' } }));
        return await this.categoryModel.aggregate(query).exec();
    }
}