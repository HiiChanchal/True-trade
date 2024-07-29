import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { InquiryDto, InquiryUpdateDto, SearchInquiryDto } from "src/dto/inquiry.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { InquiryStatusEnum } from "src/enum/inquiry.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { SuccessResponse } from "src/model/success.model";
import { PipelineService } from "./static/pipeline.service";
import { Inquiry, InquiryDocument, InquiryModel } from "src/Schema/inquiry.schema";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InquiryEventEnum } from "src/enum/event.enum";
import { UtilityService } from "./static/utility.service";
import { FirebaseService } from "./firebase.service";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { PushNotificationDto } from "src/dto/firebase.dto";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { DownloadService } from "./static/download.service";

@Injectable()
export class InquiryService {
    constructor(@InjectModel(InquiryModel.name) private inquiryModel: Model<InquiryDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        private eventEmitter: EventEmitter2, private firebaseService: FirebaseService) { }

    async create(inquiryDto: InquiryDto, user: IUser) {
        const _ticketNumber = UtilityService.inquiryTicketNumber();
        const inquiry: any = new this.inquiryModel({ type: inquiryDto.type, title: _ticketNumber, auth: user.authId, createdBy: user.authId, thread: [{ text: inquiryDto.type, from: user.authId, role: user.role }] });
        await inquiry.save();
        this.eventEmitter.emit(InquiryEventEnum.CREATED, { inquiryId: inquiry._id });
        return new SuccessResponse("Inquiry created successfully.", { inquiryId: inquiry._id });
    }
    async update(id: any, inquiryDto: InquiryUpdateDto, user: IUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, {
            $push: {
                'thread': { text: inquiryDto.text, from: user.authId, role: user.role }
            },
            updatedBy: user.authId,
        },
            { new: true, runValidators: true }
        ).exec();
        if (_doc) {
            // let _last:any = _doc.thread.pop();
            let query: PipelineStage[] = [PipelineService.match({ _id: new Types.ObjectId(id) })];
            query.push(PipelineService.project({ thread: { $last: "$thread" } }));
            if (user.role == RoleEnum.PROVIDER || user.role == RoleEnum.TRADER) {
                query.push(PipelineService.lookup('users', 'thread.from', 'auth', 'thread.user', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), status: 1, _id: 0 })]));
                query.push(PipelineService.project({ text: "$thread.text", user: { $first: "$thread.user" }, createdAt: "$thread.createdAt" }))
            }
            else {
                this.sendNotification(_doc.auth, inquiryDto.text, id);
                query.push(PipelineService.lookup('admins', 'thread.from', 'auth', 'thread.support', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
                query.push(PipelineService.project({ text: "$thread.text", support: { $first: "$thread.support" }, createdAt: "$thread.createdAt" }))
            }
            let _res: any[] = await this.inquiryModel.aggregate(query).exec();
            this.eventEmitter.emit(InquiryEventEnum.UPDATED, { inquiryId: id, role: user.role, user: _doc.auth, thread: _res[0] });
            return new SuccessResponse("Inquiry updated successfully.", _res[0]);
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, user: IUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, { active: false, updatedBy: user.authId }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Inquiry deleted successfully.");
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async close(id: any, user: IUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, { status: InquiryStatusEnum.CLOSED, updatedBy: user.authId }, { runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(InquiryEventEnum.CLOSED, { inquiryId: id, role: user.role, user: _doc.auth, title: _doc.title });
            return new SuccessResponse("Inquiry closed successfully.");
        }
        else {
            throw new BadRequestException("Resource you are trying to close does not exist.");
        }
    }
    async getAll(searchDto: SearchInquiryDto, user: IUser) {
        let _match: any = { active: true };
        if (user.role != RoleEnum.ADMIN) {
            _match.auth = new Types.ObjectId(user.authId);
        }
        if (searchDto.status) {
            _match.status = searchDto.status;
        }
        let query: PipelineStage[] = [PipelineService.match(_match), PipelineService.sort('createdAt', SortOrderEnum.DESCENDING)];
        query.push(PipelineService.lookup('users', 'auth', 'auth', 'user', [PipelineService.project({ firstName: 1, username: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
        query.push(PipelineService.project({ type: 1, status: 1, title: 1, createdAt: 1, user: { $first: "$user" } }))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return new SuccessResponse("Inquiry fetch successfully.", _res);
    }
    async getById(id: any): Promise<any> {
        let _match: any = { _id: new Types.ObjectId(id) };
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push(PipelineService.unwind("thread"));
        query.push(PipelineService.lookup('users', 'thread.from', 'auth', 'thread.user', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), status: 1, _id: 0 })]));
        query.push(PipelineService.lookup('admins', 'thread.from', 'auth', 'thread.support', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
        query.push(PipelineService.group({
            _id: "$_id",
            type: { $first: '$type' },
            status: { $first: '$status' },
            title: { $first: '$title' },
            createdAt: { $first: '$createdAt' },
            thread: {
                $push: {
                    text: "$thread.text",
                    user: { $first: "$thread.user" },
                    support: { $first: "$thread.support" },
                    createdAt: "$thread.createdAt"
                }
            }
        }))
        query.push(PipelineService.project({ type: 1, status: 1, title: 1, thread: 1, createdAt: 1 }))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return new SuccessResponse("Inquiry fetch successfully.", _res[0]);
    }
    async downloadAllChat(searchDto: SearchInquiryDto, user: IUser) {
        let _match: any = { active: true };
        if (user.role != RoleEnum.ADMIN) {
            _match.auth = new Types.ObjectId(user.authId);
        }
        if (searchDto.status) {
            _match.status = searchDto.status;
        }
        let query: PipelineStage[] = [PipelineService.match(_match), PipelineService.sort('createdAt', SortOrderEnum.DESCENDING)];
        query.push(PipelineService.lookup('users', 'auth', 'auth', 'user', [PipelineService.project({ firstName: 1, username: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
        query.push(PipelineService.project({ type: 1, status: 1, title: 1, createdAt: 1, user: { $first: "$user" } }))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return DownloadService.chat(_res);
    }
    async downloadChatHistory(id: any, user: IUser) {
        let _match: any = { _id: new Types.ObjectId(id) };
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push(PipelineService.unwind("thread"));
        query.push(PipelineService.lookup('users', 'thread.from', 'auth', 'thread.user', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), status: 1, _id: 0 })]));
        query.push(PipelineService.lookup('admins', 'thread.from', 'auth', 'thread.support', [PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
        query.push(PipelineService.group({
            _id: "$_id",
            type: { $first: '$type' },
            status: { $first: '$status' },
            title: { $first: '$title' },
            createdAt: { $first: '$createdAt' },
            thread: {
                $push: {
                    text: "$thread.text",
                    user: { $first: "$thread.user" },
                    support: { $first: "$thread.support" },
                    createdAt: "$thread.createdAt"
                }
            }
        }))
        query.push(PipelineService.project({ type: 1, status: 1, title: 1, thread: 1, createdAt: 1 }))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return DownloadService.chatHistory(_res[0]);
    }
    private async sendNotification(authId: any, msg: string, inquiryId: any) {
        const _doc: any = await this.authModel.findById(authId, { device: 1 }).exec();
        const _notification: PushNotificationDto = {
            notification: {
                title: `Support:New Message`,
                body: msg
            },
            data: {
                inquiryId: inquiryId.toString(),
                type: NotificationTypeEnum.INQUIRY
            }
        };
        if (_doc.device?.token) {
            this.firebaseService.sendPushNotification(_doc.device?.token, _notification);
        }
    }
}