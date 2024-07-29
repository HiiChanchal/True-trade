import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { SearchCommunicationDto, SendEmailDto, SendNotificationDto } from "src/dto/communication.dto";
import { SendMailService } from "./sendmail.service";
import { FirebaseService } from "./firebase.service";
import { PushNotificationDto } from "src/dto/firebase.dto";
import { CommunicationDocument, CommunicationModel } from "src/Schema/communication.schema";
import { CommunicationCategoryEnum, CommunicationTypeEnum } from "src/enum/common.enum";
import { RoleEnum } from "src/enum/role.enum";
import { NotificationDocument, NotificationModel } from "src/Schema/notification.schema";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { DownloadService } from "./static/download.service";
@Injectable()
export class CommunicationService {
    constructor(@InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(CommunicationModel.name) private communicationModel: Model<CommunicationDocument>,
        @InjectModel(NotificationModel.name) private notificationModel: Model<NotificationDocument>,
        private sendMailService: SendMailService, private firebaseService: FirebaseService) { }

    async sendEmail(emailDto: SendEmailDto, user: IUser) {
        let _match: any = { role: { $in: [RoleEnum.TRADER, RoleEnum.PROVIDER] } };
        if (emailDto.users.length > 0)
            _match['username'] = { $in: emailDto.users };
        const _doc: any[] = await this.authModel.find(_match, { username: 1 }).exec();
        let _to: string[] = [];
        _doc.forEach((ele) => {
            _to.push(ele.username);
        });
        if (_to.length > 0) {
            this.sendMailService.sendCommunicationEmail(_to, emailDto.subject, emailDto.body);
        }
        await new this.communicationModel({ type: CommunicationTypeEnum.EMAIL, users: _to, title: emailDto.subject, body: emailDto.body }).save();
        return new SuccessResponse("Email send successfully.");
    }
    async sendNotification(notificationDto: SendNotificationDto, user: IUser) {
        let _find: any = { role: { $in: [RoleEnum.TRADER, RoleEnum.PROVIDER] }, "device.platform": { $in: notificationDto.platform } };
        if (notificationDto.users.length > 0) {
            _find["username"] = { $in: notificationDto.users };
        }
        const _doc: any[] = await this.authModel.find(_find, { username: 1, role: 1, device: 1 }).exec();
        const _length: number = _doc.length;
        let _to: string[] = [];
        const _communication = await new this.communicationModel({ type: CommunicationTypeEnum.PUSHNOTIFICATION, platform: notificationDto.platform, category: notificationDto.category, users: _to, title: notificationDto.title, body: notificationDto.body }).save();
        const _notification: PushNotificationDto = {
            notification: {
                title: `${notificationDto.category}:${notificationDto.title}`,
                body: notificationDto.body
            },
            data: {
                id: _communication._id.toString(),
                type: notificationDto.category == CommunicationCategoryEnum.MARKETNEWS ? NotificationTypeEnum.OTHERS : NotificationTypeEnum.PROFILE,
                click: "true"
            }
        };
        for (let i = 0; i < _length; i++) {
            if (_doc[i].device) {
                _to.push(_doc[i].username);
                this.firebaseService.sendPushNotification(_doc[i].device.token, _notification);
                new this.notificationModel({ auth: _doc[i]._id, role: _doc[i].role, type: NotificationTypeEnum.OTHERS, text: `${notificationDto.category}:${notificationDto.title}` }).save();
            }
        }
        return new SuccessResponse("Notification send successfully.");
    }

    async getCommunication(searchDto: SearchCommunicationDto, user: IUser) {
        const _doc = await this.communicationModel.find({ type: searchDto.type }, {}, { sort: { createdAt: -1 } }).exec();
        return new SuccessResponse("Communication fetch successfully.", _doc);
    }
    async notificationClick(id: any, user: IUser) {
        this.communicationModel.findByIdAndUpdate(id, { $inc: { click: 1 } }).exec();
        return new SuccessResponse("Successfully.");
    }
    async downloadCommunication(searchDto: SearchCommunicationDto, user: IUser) {
        const _doc = await this.communicationModel.find({ type: searchDto.type }, {}, { sort: { createdAt: -1 } }).exec();
        return DownloadService.communication(_doc);
    }
}