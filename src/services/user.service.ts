import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { UserDocument, UserModel } from "src/Schema/user.schema";
import { NameDto, UserInterestDto, UserNotificationRequestDto, UserUpdateDto, WalletDto } from "src/dto/user.dto";
import { UsernameDto } from "src/dto/auth.dto";
import { AvatarDocument, AvatarModel } from "src/Schema/avatar.schema";
import { PipelineService } from "./static/pipeline.service";
import { AppConfigService } from "./config.service";
import { ProfileStatusEnum, RoleEnum } from "src/enum/role.enum";
import { StripeService } from "./stripe.service";
import { TransactionDocument, TransactionModel } from "src/Schema/transaction.schema";
import { TransactionForTypeEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/enum/transaction.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentEventEnum } from "src/enum/event.enum";
import { SortOrderEnum } from "src/enum/common.enum";
import { NotificationDocument, NotificationModel } from "src/Schema/notification.schema";
import { PaginationResponse } from "src/model/pagination.model";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { PaymentMethodDocument, PaymentMethodModel } from "src/Schema/payment-method.schema";
import { PaymentMethodDto } from "src/dto/payment-method.dto";
import { DepositDto } from "src/dto/deposit.dto";
import { WithdrawDto } from "src/dto/withdraw.dto";
@Injectable()
export class UserService {
    constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(AvatarModel.name) private avatarModel: Model<AvatarDocument>,
        @InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(NotificationModel.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(PaymentMethodModel.name) private paymentMethodModel: Model<PaymentMethodDocument>,
        private appConfigService: AppConfigService, private stripeService: StripeService, private eventEmitter: EventEmitter2) { }

    async image(filename: string, user: IUser) {
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { image: filename } }, { runValidators: true }).exec();
        if (_doc) {
            if (_doc.status !== ProfileStatusEnum.PROCEED && _doc.selfie == null) {
                await this.userModel.findByIdAndUpdate(_doc._id, { $set: { status: ProfileStatusEnum.PROCEED } }).exec();
            }
            return new SuccessResponse("Profile image uploaded successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async deleteImage(user: IUser) {
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { image: null } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Profile image deleted successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async selfie(filename: string, user: IUser) {
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { selfie: filename, status: ProfileStatusEnum.PROCEED } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Selfie uploaded successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async name(nameDto: NameDto, user: IUser) {
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { ...nameDto } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Name updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async username(usernameDto: UsernameDto, user: IUser) {
        const _find = await this.userModel.findOne({ auth: { $ne: new Types.ObjectId(user.authId) }, username: usernameDto.username }).exec();
        if (_find) {
            throw new BadRequestException("The username already taken by someone.");
        }
        else {
            const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { ...usernameDto } }, { runValidators: true }).exec();
            if (_doc) {
                return new SuccessResponse("Username updated successfully.");
            }
            else {
                throw new BadRequestException("The resource you are trying to update does not exist.");
            }
        }
    }
    async interest(userInterestDto: UserInterestDto, user: IUser) {
        let _addToSet: any = { traderInterest: userInterestDto.interest };
        if (user.role == RoleEnum.PROVIDER) {
            _addToSet = { providerInterest: userInterestDto.interest };
        }
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $addToSet: _addToSet }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Interest updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async usernameCheck(usernameDto: UsernameDto, user: IUser) {
        const _find = await this.userModel.findOne({ auth: { $ne: new Types.ObjectId(user.authId) }, username: usernameDto.username.toLowerCase() }).exec();
        return new SuccessResponse("Username checked successfully.", { available: _find ? false : true });
    }
    async deleteInterest(id: any, user: IUser) {
        let _pull: any = { traderInterest: new Types.ObjectId(id) };
        if (user.role == RoleEnum.PROVIDER) {
            _pull = { providerInterest: new Types.ObjectId(id) };
        }
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $pull: _pull }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Interest deleted successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async updateUser(userUpdateDto: UserUpdateDto, filename: string, user: IUser) {
        const _find = await this.userModel.findOne({ auth: { $ne: new Types.ObjectId(user.authId) }, username: userUpdateDto.username.toLowerCase() }).exec();
        if (_find) {
            throw new BadRequestException("The username already taken by someone.");
        }
        let _update: any = { ...userUpdateDto };
        delete _update.image;
        if (filename || userUpdateDto.avatar) {
            _update['image'] = filename || userUpdateDto.avatar;
            if (userUpdateDto.avatar) {
                _update['status'] = ProfileStatusEnum.PENDING;
                _update['selfie'] = null;
            }
        }
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: _update }, { runValidators: true, new: true }).exec();
        if (_doc) {
            if (_doc.status !== ProfileStatusEnum.PROCEED && _doc.selfie == null && filename) {
                await this.userModel.findByIdAndUpdate(_doc._id, { $set: { status: ProfileStatusEnum.PROCEED } }).exec();
            }
            return new SuccessResponse("Profile updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async avatar(user: IUser) {
        const _doc = await this.avatarModel.find({}, { name: 1, url: PipelineService.file('images/profile', '$name') }).exec();
        return new SuccessResponse("Avatar get successfully.", _doc);
    }
    async addWallet(walletDto: WalletDto, user: IUser) {
        let _doc = await this.userModel.findOne({ auth: new Types.ObjectId(user.authId) }).exec();
        if (!_doc.customerId) {
            const _sc: any = await this.stripeService.createCustomer({ email: _doc.email, name: _doc.firstName });
            _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { customerId: _sc.id } }, { runValidators: true, new: true }).exec();
        }
        const _res = await this.stripeService.charge(walletDto.amount * 100, walletDto.paymentMethodId, _doc.customerId);
        const success: boolean = _res.status == 'succeeded';
        await new this.transactionModel({
            auth: new Types.ObjectId(user.authId),
            role: RoleEnum.TRADER,
            amount: walletDto.amount,
            paymentId: _res.id,
            type: TransactionTypeEnum.CREDIT,
            for: TransactionForTypeEnum.DEPOSIT,
            status: success ? TransactionStatusEnum.ACCEPTED : TransactionStatusEnum.INITIATED,
            data: _res
        }).save();
        if (success) {
            await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $inc: { traderWallet: walletDto.amount } }).exec();
            new this.notificationModel({ auth: new Types.ObjectId(user.authId), role: RoleEnum.TRADER, type: NotificationTypeEnum.WALLET, text: `Your account has been credited with $${walletDto.amount}. Happy trading!`, data: { amount: walletDto.amount } }).save();
        }
        return new SuccessResponse(`${success ? 'Payment Successfully done.' : 'Payment successfully initialize.'}`, _res);
    }
    // async withdraw(withdrawDto: WithdrawDto, user: IUser) {
    //     let _doc = await this.userModel.findOne({ auth: new Types.ObjectId(user.authId) }).exec();
    //     if (!_doc.accountId) {
    //         const _sa: any = await this.stripeService.createAccount({ email: _doc.email, name: _doc.firstName });
    //         _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $set: { accountId: _sa.id } }, { runValidators: true, new: true }).exec();
    //     }
    //     const _res = await this.stripeService.createSession(_doc.accountId);
    //     return new SuccessResponse(``, _res);
    // }
    async stripePublicKey() {
        let _key = this.appConfigService.stripePublishableKey;
        return new SuccessResponse("Public key fetch successfully.", _key);
    }
    async notification(searchDto: UserNotificationRequestDto, user: IUser) {
        let _match: any = { auth: new Types.ObjectId(user.authId), role: user.role };
        if (searchDto.type == NotificationTypeEnum.SIGNAL) {
            _match['type'] = NotificationTypeEnum.SIGNAL;
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.project({ type: 1, text: 1, read: 1, createdAt: 1, data: 1, image: PipelineService.file('images/profile', '$image') })
                ],
            },
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.notificationModel.aggregate(query).exec();
        return new SuccessResponse("Provider fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async markAsRead(id: any, user: IUser) {
        await this.notificationModel.findByIdAndUpdate(id, { $set: { read: true } }).exec();
        return new SuccessResponse("Mark as read successfully.");
    }
    async markAllAsRead(user: IUser) {
        await this.notificationModel.updateMany({ auth: new Types.ObjectId(user.authId), role: user.role, read: false }, { $set: { read: true } }).exec();
        return new SuccessResponse("Mark all as read successfully.");
    }
    async webhook(signature: string, body: any) {
        const event = await this.stripeService.constructEvent(signature, body);
        // if (event.type == 'payment_intent.succeeded') {
        //     this.processPayment(event.data.object, TransactionStatusEnum.ACCEPTED);
        // }
        // if (event.type == 'payment_intent.payment_failed') {
        //     this.processPayment(event.data.object, TransactionStatusEnum.REJECTED);
        // }
        // if (event.type == 'payment_intent.canceled') {
        //     this.processPayment(event.data.object, TransactionStatusEnum.CANCELED);
        // }
        return new SuccessResponse("Webhook success.", { received: true });
    }
    async addPaymentMethod(paymentMethodDto: PaymentMethodDto, filename: string, user: IUser) {
        let _data: any = { ...paymentMethodDto };
        if (filename) {
            _data['image'] = filename;
        }
        const _doc = await new this.paymentMethodModel({ ..._data, role: user.role, auth: user.authId, createdBy: user.authId }).save();
        if (_doc) {
            return new SuccessResponse("Payment Method added successfully.", _doc);
        }
        else {
            throw new BadRequestException("Payment Method not added.");
        }
    }
    async updatePaymentMethod(id: string, paymentMethodDto: PaymentMethodDto, filename: string, user: IUser) {
        let _data: any = { ...paymentMethodDto };
        if (filename) {
            _data['image'] = filename;
        }
        const _doc = await this.paymentMethodModel.findOneAndUpdate({ _id: new Types.ObjectId(id), auth: user.authId }, { $set: { ..._data, updatedBy: user.authId } }, { runValidators: true, new: true }).exec();
        if (_doc) {
            return new SuccessResponse("Payment Method updated successfully.", _doc);
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async getPaymentMethod(user: IUser) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ auth: new Types.ObjectId(user.authId), role: RoleEnum.PROVIDER }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc)
    }
    async getPaymentMethodById(id: any, user: IUser) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ _id: new Types.ObjectId(id), auth: new Types.ObjectId(user.authId) }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc[0]);
    }
    async deposit(depositDto: DepositDto, filename: string, user: IUser) {
        const _pm = await this.paymentMethodModel.findById(depositDto.paymentMethodId, { title: 1, type: 1, upiId: 1, accountHolderName: 1, bankName: 1, accountNumber: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1, image: PipelineService.file('images/pm', '$image') });
        let _data: any = {
            auth: new Types.ObjectId(user.authId),
            role: user.role,
            amount: depositDto.amount,
            type: TransactionTypeEnum.CREDIT,
            paymentTransactionId: depositDto.transactionId,
            for: TransactionForTypeEnum.DEPOSIT,
            status: TransactionStatusEnum.INITIATED,
            paymentId: depositDto.paymentMethodId,
            data: {
                ..._pm
            }
        }
        if (filename) {
            _data['file'] = filename;
        }
        await new this.transactionModel({ ..._data }).save();
        return new SuccessResponse('Your deposit request has been submited.');
    }
    async withdraw(withdrawDto: WithdrawDto, user: IUser) {
        const _pm = await this.paymentMethodModel.findById(withdrawDto.paymentMethodId, { title: 1, type: 1, upiId: 1, accountHolderName: 1, bankName: 1, accountNumber: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1, image: PipelineService.file('images/pm', '$image') });
        let _data: any = {
            auth: new Types.ObjectId(user.authId),
            role: user.role,
            amount: withdrawDto.amount,
            commission: withdrawDto.commission,
            charge: withdrawDto.charge,
            type: TransactionTypeEnum.DEBIT,
            for: TransactionForTypeEnum.WITHDRAW,
            status: TransactionStatusEnum.INITIATED,
            paymentId: withdrawDto.paymentMethodId,
            data: {
                ..._pm
            }
        }
        await new this.transactionModel({ ..._data }).save();
        return new SuccessResponse('Your withdraw request has been submited.');
    }
    // private async processPayment(data: any, status: string) {
    //     const _doc = await this.transactionModel.findOneAndUpdate({ paymentId: data.id }, { $set: { status: status, data: data } }).exec();
    //     if (_doc.status != TransactionStatusEnum.ACCEPTED && status == TransactionStatusEnum.ACCEPTED) {
    //         this.eventEmitter.emit(PaymentEventEnum.ACCEPTED, { role: _doc.role, user: _doc.auth });
    //         await this.userModel.findOneAndUpdate({ auth: _doc.auth }, { $inc: { traderWallet: _doc.amount } }).exec();
    //         new this.notificationModel({ auth: _doc.auth, role: RoleEnum.TRADER, type: NotificationTypeEnum.WALLET, text: `Your account has been credited with $${_doc.amount}. Happy trading!`, data: { amount: _doc.amount } }).save();
    //     }
    // }
}