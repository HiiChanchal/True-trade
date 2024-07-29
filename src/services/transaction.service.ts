import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { TransactionDocument, TransactionModel } from "src/Schema/transaction.schema";
import { DepositDownloadDto, DepositRequestDto, UpdateDepositRequestDto, UpdateWithdrawRequestDto, WithdrawDownloadDto, WithdrawRequestDto } from "src/dto/transaction.dto";
import { IUser } from "src/interface/user.interface";
import { SuccessResponse } from "src/model/success.model";
import { PipelineService } from "./static/pipeline.service";
import { TransactionForTypeEnum, TransactionStatusEnum } from "src/enum/transaction.enum";
import { SortOrderEnum } from "src/enum/common.enum";
import { PaginationResponse } from "src/model/pagination.model";
import { UserDocument, UserModel } from "src/Schema/user.schema";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { NotificationDocument, NotificationModel } from "src/Schema/notification.schema";
import { FirebaseService } from "./firebase.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentEventEnum } from "src/enum/event.enum";
import { RoleEnum } from "src/enum/role.enum";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { PushNotificationDto } from "src/dto/firebase.dto";
import { DownloadService } from "./static/download.service";


@Injectable()
export class TransactionService {
    constructor(@InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(NotificationModel.name) private notificationModel: Model<NotificationDocument>,
        private firebaseService: FirebaseService,
        private eventEmitter: EventEmitter2) { }

    async getDepositRequest(searchDto: DepositRequestDto, user?: IUser) {
        let match: any = { for: TransactionForTypeEnum.DEPOSIT, status: searchDto.status }
        if (searchDto.startDate && searchDto.endDate) {
            match.createdAt = { $gte: new Date(searchDto.startDate), $lte: new Date(searchDto.endDate) }
        }
        let _match: any = {};
        let _userQuery: any[] = []
        if (searchDto.search) {
            _match['username'] = {
                $regex: new RegExp(`${searchDto.search}`, "ig"),
            }
        }
        let query: PipelineStage[] = [PipelineService.match(match)];
        if (searchDto.search) {
            _userQuery.push(PipelineService.match(_match))
            _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))
            query.push(
                PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]),
                PipelineService.match({ $expr: { $gt: [{ $size: "$user" }, 0] } }),
                {
                    $facet: {
                        count: [{ $count: "total" }],
                        data: [
                            PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                            PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                            PipelineService.limit(searchDto.pageSize),
                            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 })
                        ]
                    }
                })
        } else {
            _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))
            query.push(
                {
                    $facet: {
                        count: [{ $count: "total" }],
                        data: [
                            PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                            PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                            PipelineService.limit(searchDto.pageSize),
                            PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]),
                            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 })
                        ]
                    }
                })
        }

        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.transactionModel.aggregate(query).exec();
        return new SuccessResponse("Transaction fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getWithdrawRequest(searchDto: DepositRequestDto, user: IUser) {
        let match: any = { for: TransactionForTypeEnum.WITHDRAW, status: searchDto.status }
        if (searchDto.startDate && searchDto.endDate) {
            match.createdAt = { $gte: new Date(searchDto.startDate), $lte: new Date(searchDto.endDate) }
        }
        let _match: any = {};
        let _userQuery: any[] = []
        if (searchDto.search) {
            _match['username'] = {
                $regex: new RegExp(`${searchDto.search}`, "ig"),
            }
        }
        let query: PipelineStage[] = [PipelineService.match(match)];

        if (searchDto.search) {
            _userQuery.push(PipelineService.match(_match))
            _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))
            query.push(
                PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]),
                PipelineService.match({ $expr: { $gt: [{ $size: "$user" }, 0] } }),
                {
                    $facet: {
                        count: [{ $count: "total" }],
                        data: [
                            PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                            PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                            PipelineService.limit(searchDto.pageSize),
                            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 })
                        ]
                    }
                })
        } else {
            _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))
            query.push(
                {
                    $facet: {
                        count: [{ $count: "total" }],
                        data: [
                            PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                            PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                            PipelineService.limit(searchDto.pageSize),
                            PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]),
                            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 })
                        ]
                    }
                })
        }
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.transactionModel.aggregate(query).exec();
        return new SuccessResponse("Transaction fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async updateDepositRequest(id: any, updateDepositRequestDto: UpdateDepositRequestDto, user: IUser) {
        const _doc = await this.transactionModel.findOneAndUpdate({ _id: new Types.ObjectId(id), status: TransactionStatusEnum.INITIATED, for: TransactionForTypeEnum.DEPOSIT }, { $set: { status: updateDepositRequestDto.status, remark: updateDepositRequestDto.remark } }, { runValidators: true, new: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(updateDepositRequestDto.status == TransactionStatusEnum.REJECTED ? PaymentEventEnum.REJECTED : PaymentEventEnum.ACCEPTED, { role: _doc.role, user: _doc.auth });
            if (updateDepositRequestDto.status == TransactionStatusEnum.ACCEPTED)
                await this.userModel.findOneAndUpdate({ auth: _doc.auth }, { $inc: { traderWallet: _doc.amount } }).exec();
            let _nt = `Your account has been credited with $${_doc.amount}. Happy trading!`;
            if (updateDepositRequestDto.status == TransactionStatusEnum.REJECTED)
                _nt = `Your wallet deposit transaction with transactionid ${_doc.paymentTransactionId} has been declined.`;
            const _auth = await this.authModel.findById(_doc.auth).exec();
            new this.notificationModel({ auth: _doc.auth, role: RoleEnum.TRADER, type: NotificationTypeEnum.WALLET, text: _nt, data: { amount: _doc.amount } }).save();
            if (_auth.device.token) {
                const _notification: PushNotificationDto = {
                    notification: {
                        title: `TrueTrader Transaction`,
                        body: _nt
                    },
                    data: {
                        type: NotificationTypeEnum.WALLET
                    }
                };
                this.firebaseService.sendPushNotification(_auth.device.token, _notification);
            }
            return new SuccessResponse("Transaction updated successfully.")
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async updateWithdrawRequest(id: any, updateWithdrawRequestDto: UpdateWithdrawRequestDto, filename: string, user: IUser) {
        let _data: any = {
            status: updateWithdrawRequestDto.status,
            paymentTransactionId: updateWithdrawRequestDto.transactionId,
            remrk: updateWithdrawRequestDto.remark
        }
        if (filename) {
            _data['file'] = filename;
        }
        const _doc = await this.transactionModel.findOneAndUpdate({ _id: new Types.ObjectId(id), status: TransactionStatusEnum.INITIATED, for: TransactionForTypeEnum.WITHDRAW }, { $set: _data }, { runValidators: true, new: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(updateWithdrawRequestDto.status == TransactionStatusEnum.REJECTED ? PaymentEventEnum.REJECTED : PaymentEventEnum.ACCEPTED, { role: _doc.role, user: _doc.auth });
            if (updateWithdrawRequestDto.status == TransactionStatusEnum.ACCEPTED)
                await this.userModel.findOneAndUpdate({ auth: _doc.auth }, { $inc: { providerWallet: -_doc.amount, withdraw: _doc.amount } }).exec();
            let _nt = `Your account has been debited with $${_doc.amount}. Happy trading!`;
            if (updateWithdrawRequestDto.status == TransactionStatusEnum.REJECTED)
                _nt = `Your withdraw transaction from wallet with amount ${_doc.amount} has been declined.`;
            new this.notificationModel({ auth: _doc.auth, role: RoleEnum.PROVIDER, type: NotificationTypeEnum.WALLET, text: _nt, data: { amount: _doc.amount } }).save();
            const _auth = await this.authModel.findById(_doc.auth).exec();
            if (_auth.device.token) {
                const _notification: PushNotificationDto = {
                    notification: {
                        title: `TrueTrader Transaction`,
                        body: _nt
                    },
                    data: {
                        type: NotificationTypeEnum.WALLET
                    }
                };
                this.firebaseService.sendPushNotification(_auth.device.token, _notification);
            }
            return new SuccessResponse("Transaction updated successfully.")
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }

    async downloadDeposit(searchDto: DepositDownloadDto) {
        let match: any = { for: TransactionForTypeEnum.DEPOSIT, status: searchDto.status }
        if (searchDto.startDate && searchDto.endDate) {
            match.createdAt = { $gte: new Date(searchDto.startDate), $lte: new Date(searchDto.endDate) }
        }
        let _match: any = {};
        let _userQuery: any[] = []
        if (searchDto.search) {
            _match['username'] = {
                $regex: new RegExp(`${searchDto.search}`, "ig"),
            }
        }
        let query: PipelineStage[] = [PipelineService.match(match)];
        if (searchDto.search) _userQuery.push(PipelineService.match(_match))

        _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))

        query.push(PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]));
        if (searchDto.search) query.push(PipelineService.match({ user: { $size: 1 } }))
        query.push(PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 }),
        )
        const _doc = await this.transactionModel.aggregate(query);
        return DownloadService.depositTransaction(_doc)
    }
    async downloadWithdraw(searchDto: WithdrawDownloadDto) {
        let match: any = { for: TransactionForTypeEnum.WITHDRAW, status: searchDto.status }
        if (searchDto.startDate && searchDto.endDate) {
            match.createdAt = { $gte: new Date(searchDto.startDate), $lte: new Date(searchDto.endDate) }
        }
        let _match: any = {};
        let _userQuery: any[] = []
        if (searchDto.search) {
            _match['username'] = {$regex: new RegExp(`${searchDto.search}`, "ig")}
        }
        let query: PipelineStage[] = [PipelineService.match(match)];
        if (searchDto.search) _userQuery.push(PipelineService.match(_match))
        _userQuery.push(PipelineService.project({ username: 1, firstName: 1, lastName: 1, traderWallet: 1, providerWallet: 1, withdraw: 1, email: 1, image: PipelineService.file('images/profile', '$image') }))
        query.push(PipelineService.lookup('users', 'auth', 'auth', 'user', [..._userQuery]));
        if (searchDto.search) query.push(PipelineService.match({ user: { $size: 1 } }));
        query.push(
            PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
            PipelineService.project({ user: { $first: "$user" }, role: 1, amount: 1, type: 1, paymentTransactionId: 1, status: 1, data: 1, remark: 1, file: PipelineService.file('images/transaction', '$file'), createdAt: 1, updatedAt: 1 }),
        )
        const _doc = await this.transactionModel.aggregate(query);
        return DownloadService.withdrawTransaction(_doc)
    }
}