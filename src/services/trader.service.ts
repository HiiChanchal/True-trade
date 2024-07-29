import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { UserDocument, UserModel } from "src/Schema/user.schema";
import { CategoryDocument, CategoryModel } from "src/Schema/category.schema";
import { PipelineService } from "./static/pipeline.service";
import { SearchProviderForTraderDto, SearchTraderSignalDto, SearchTraderSubscriptionDto, TraderSubscriptionDto, TraderSubscriptionPlanDto, UnsubscribeDto } from "src/dto/trader.dto";
import { SubscriptionPlanDocument, SubscriptionPlanModel } from "src/Schema/subscription-plan.schema";
import { SearchDto } from "src/dto/search.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { PaginationResponse } from "src/model/pagination.model";
import { SubscriptionDocument, SubscriptionModel } from "src/Schema/subscription.schema";
import { TransactionDocument, TransactionModel } from "src/Schema/transaction.schema";
import { DateService } from "./static/date.service";
import { TransactionForTypeEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/enum/transaction.enum";
import { SubscriptionPlanDurationEnum, SubscriptionStatusEnum } from "src/enum/subscription.enum";
import { SearchTraderDto } from "src/dto/admin.dto";
import { RoleEnum } from "src/enum/role.enum";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { SignalDocument, SignalModel } from "src/Schema/signal.schema";
import { NotificationDocument, NotificationModel } from "src/Schema/notification.schema";
import { FirebaseService } from "./firebase.service";
import { PushNotificationDto } from "src/dto/firebase.dto";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { MyTradeDocument, MyTradeModel } from "src/Schema/my-trade.schema";
import { DownloadService } from "./static/download.service";
import { SignalStatusEnum } from "src/enum/signal.enum";
import { SignalCommentViewDocument, SignalCommentViewModel } from "src/Schema/signal-comment-view.schema";
@Injectable()
export class TraderService {
    constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(SubscriptionPlanModel.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
        @InjectModel(SubscriptionModel.name) private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(SignalModel.name) private signalModel: Model<SignalDocument>,
        @InjectModel(MyTradeModel.name) private myTradeModel: Model<MyTradeDocument>,
        @InjectModel(NotificationModel.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(SignalCommentViewModel.name) private signalCommentViewModel: Model<SignalCommentViewDocument>,
        private firebaseService: FirebaseService
    ) { }

    async getProviderForCategory(searchDto: SearchDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ active: true })];
        let _filterQuery: any[] = [PipelineService.match({ auth: { $ne: new Types.ObjectId(user.authId) } })];
        if (searchDto.search) {
            _filterQuery.push(PipelineService.lookup('users', 'auth', 'auth', 'provider', [
                PipelineService.match({ firstName: { $regex: new RegExp(`${searchDto.search}`, "ig") } }),
                PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: "$auth", createdAt: 1, _id: 0 })
            ]));
            _filterQuery.push(PipelineService.match({ "provider": { $size: 1 } }));
            // _filterQuery.push(PipelineService.sort('createdAt', SortOrderEnum.DESCENDING));
            // _filterQuery.push(PipelineService.skip(1, 4));
            // _filterQuery.push(PipelineService.limit(4));
            _filterQuery.push({ $sample: { size: 4 } });
            _filterQuery.push(PipelineService.lookupWithLet('subscriptions', { 'category': '$category', 'provider': '$auth' }, 'subscription', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$provider', '$$provider'] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    subscription: {
                        $push: PipelineService.condition({ $eq: ['$auth', new Types.ObjectId(user.authId)] }, { status: '$status', startDate: '$startDate', endDate: '$endDate', amount: '$amount', duration: '$duration' }, '$$REMOVE')
                    }
                }),
                PipelineService.project({ total: 1, subscription: { $first: '$subscription' }, _id: 0 })
            ]));
            _filterQuery.push(PipelineService.lookupWithLet('signals', { 'category': '$category', 'provider': '$auth', 'createdAt': { $arrayElemAt: ["$provider.createdAt", 0] } }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$auth', '$$provider'] } }, { active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
            ]));
            _filterQuery.push(PipelineService.project({ monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, provider: { $first: '$provider' }, totalSubscriber: { $arrayElemAt: ["$subscription.total", 0] }, subscription: { $arrayElemAt: ["$subscription.subscription", 0] }, signal: { $first: '$signal' } }));
        }
        else {
            // _filterQuery.push(PipelineService.sort('createdAt', SortOrderEnum.DESCENDING));
            // _filterQuery.push(PipelineService.skip(1, 4));
            // _filterQuery.push(PipelineService.limit(4));
            _filterQuery.push({ $sample: { size: 4 } });
            _filterQuery.push(PipelineService.lookupWithLet('subscriptions', { 'category': '$category', 'provider': '$auth' }, 'subscription', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$provider', '$$provider'] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    subscription: {
                        $push: PipelineService.condition({ $eq: ['$auth', new Types.ObjectId(user.authId)] }, { status: '$status', startDate: '$startDate', endDate: '$endDate', amount: '$amount', duration: '$duration', _id: '$_id' }, '$$REMOVE')
                    }
                }),
                PipelineService.project({ total: 1, subscription: { $first: '$subscription' }, _id: 0 })
            ]));
            _filterQuery.push(PipelineService.lookup('users', 'auth', 'auth', 'provider', [PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: "$auth", createdAt: 1, _id: 0 })]))
            _filterQuery.push(PipelineService.lookupWithLet('signals', { 'category': '$category', 'provider': '$auth', 'createdAt': { $arrayElemAt: ["$provider.createdAt", 0] } }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$auth', '$$provider'] } }, { active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
            ]));
            _filterQuery.push(PipelineService.project({ monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, provider: { $first: '$provider' }, totalSubscriber: { $arrayElemAt: ["$subscription.total", 0] }, subscription: { $arrayElemAt: ["$subscription.subscription", 0] }, signal: { $first: '$signal' } }));
        }
        query.push(PipelineService.lookup('subscription-plans', '_id', 'category', 'plans', [PipelineService.match({ active: true }), ..._filterQuery]));
        query.push(PipelineService.project({ name: 1, plans: 1 }));
        let _res: any[] = await this.categoryModel.aggregate(query).exec();
        return new SuccessResponse("Provider fetch successfully.", _res);
    }
    async getSearchProvider(searchDto: SearchProviderForTraderDto, user: IUser) {
        let _match: any = { auth: { $ne: new Types.ObjectId(user.authId) }, active: true };
        if (searchDto.category) {
            _match['category'] = new Types.ObjectId(searchDto.category);
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push(PipelineService.group({
            _id: "$auth",
            category: { $push: "$category" },
            monthly: { $first: "$monthly" },
            quarterly: { $first: "$quarterly" },
            halfYearly: { $first: "$halfYearly" },
            yearly: { $first: "$yearly" },
            createdAt: { $last: "$createdAt" }
        }))
        query.push(PipelineService.project({ auth: "$_id", category: 1, monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, createdAt: 1 }))
        let _filterQuery: any[] = [];
        if (searchDto.search) {
            query.push(PipelineService.lookup('users', 'auth', 'auth', 'provider', [
                PipelineService.match({ firstName: { $regex: new RegExp(`${searchDto.search}`, "ig") } }),
                PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: "$auth", createdAt: 1, _id: 0 })
            ]));
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', 'auth', 'auth', 'provider', [PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: "$auth", createdAt: 1, _id: 0 })]));
        }
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.lookupWithLet('subscriptions', { 'provider': '$auth', 'category': "$category" }, 'subscription', [
                        PipelineService.match({ $and: [{ "$expr": { $eq: ['$provider', '$$provider'] } }, { $expr: { $in: ["$category", "$$category"] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                        PipelineService.group({
                            _id: null,
                            total: { $sum: 1 },
                            subscription: {
                                $push: PipelineService.condition({ $eq: ['$auth', new Types.ObjectId(user.authId)] }, { status: '$status', startDate: '$startDate', endDate: '$endDate', amount: '$amount', duration: '$duration', _id: '$_id' }, '$$REMOVE')
                            }
                        }),
                        PipelineService.project({ total: 1, subscription: { $first: '$subscription' }, _id: 0 })
                    ]),
                    ..._filterQuery,
                    PipelineService.lookupWithLet('signals', { 'provider': '$auth', 'category': "$category", 'createdAt': { $arrayElemAt: ["$provider.createdAt", 0] } }, 'signal', [
                        PipelineService.match({ $and: [{ "$expr": { $eq: ['$auth', '$$provider'] } }, { $expr: { $in: ["$category", "$$category"] } }, { active: true }] }),
                        PipelineService.group({
                            _id: null,
                            total: { $sum: 1 },
                            win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                            loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                        }),
                        PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
                    ]),
                    PipelineService.lookupWithLet('categories', { 'category': "$category" }, 'category', [PipelineService.match({ $expr: { $in: ["$_id", "$$category"] } }), PipelineService.project({ name: 1 })]),
                    PipelineService.project({ monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, category: 1, provider: { $first: '$provider' }, totalSubscriber: { $arrayElemAt: ["$subscription.total", 0] }, subscription: { $arrayElemAt: ["$subscription.subscription", 0] }, signal: { $first: '$signal' } })
                ]
            }
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }));
        let _res: any[] = await this.subscriptionPlanModel.aggregate(query).exec();
        return new SuccessResponse("Provider fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getProviderPlans(id: any, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(id) })];
        query.push(PipelineService.lookupWithLet('subscription-plans', { 'auth': '$auth', createdAt: '$createdAt' }, 'plans', [
            PipelineService.match({ $and: [{ "$expr": { $eq: ['$auth', '$$auth'] } }, { active: true }] }),
            PipelineService.lookupWithLet('subscriptions', { 'category': '$category' }, 'subscription', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { provider: new Types.ObjectId(id), status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    subscription: {
                        $push: PipelineService.condition({ $eq: ['$auth', new Types.ObjectId(user.authId)] }, { status: '$status', startDate: '$startDate', endDate: '$endDate', amount: '$amount', duration: '$duration', _id: '$_id' }, '$$REMOVE')
                    }
                }),
                PipelineService.project({ total: 1, subscription: { $first: '$subscription' }, _id: 0 })
            ]),
            PipelineService.lookupWithLet('signals', { 'category': '$category' }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { auth: new Types.ObjectId(id), active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
            ]),
            PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]),
            PipelineService.project({ category: { $first: "$category" }, totalSubscriber: { $arrayElemAt: ["$subscription.total", 0] }, subscription: { $arrayElemAt: ["$subscription.subscription", 0] }, signal: { $first: '$signal' }, monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1 }),
            PipelineService.sort("subscription", SortOrderEnum.DESCENDING)
        ]));
        query.push(PipelineService.project({ firstName: 1, lastName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), plans: 1, id: "$auth", _id: 0 }));
        const res: any = await this.userModel.aggregate(query).exec();
        return new SuccessResponse("Plan fetch successfully.", res[0]);
    }
    async subscription(traderSubscriptionDto: TraderSubscriptionDto, user: IUser) {
        let _planIds = traderSubscriptionDto.plans.map((ele: TraderSubscriptionPlanDto) => new Types.ObjectId(ele.plan));
        const _user = await this.userModel.findOne({ auth: new Types.ObjectId(user.authId) }).exec();
        const _plans = await this.subscriptionPlanModel.find({ _id: { $in: _planIds }, auth: new Types.ObjectId(traderSubscriptionDto.provider) });
        let _total: number = 0;
        let _subscription = [];
        let _alreadyExist: any[] = [];
        const _timezone = new Date().getTimezoneOffset();
        const _pl = _plans.length;
        for (let i = 0; i < _pl; i++) {
            let obj: any = _plans[i];
            let _startDate: Date = new Date();
            let _endDate: Date = new Date();
            const _find = traderSubscriptionDto.plans.find((ele: any) => ele.plan == obj._id);
            let _amount: number = 0;
            if (_find.duration == SubscriptionPlanDurationEnum.MONTHLY) {
                _amount = obj.monthly;
                _endDate.setMonth(_endDate.getMonth() + 1);
            }
            else if (_find.duration == SubscriptionPlanDurationEnum.QUARTERLY) {
                _amount = obj.quarterly;
                _endDate.setMonth(_endDate.getMonth() + 3);
            }
            else if (_find.duration == SubscriptionPlanDurationEnum.HALFYEARLY) {
                _amount = obj.halfYearly;
                _endDate.setMonth(_endDate.getMonth() + 6);
            }
            else {
                _amount = obj.yearly;
                _endDate.setMonth(_endDate.getFullYear() + 1);
            }
            const _already = await this.subscriptionModel.findOne({ auth: new Types.ObjectId(user.authId), provider: new Types.ObjectId(traderSubscriptionDto.provider), category: new Types.ObjectId(obj.category), status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } });
            if (_already)
                _alreadyExist.push(_already);
            else {
                _subscription.push(new this.subscriptionModel({
                    auth: new Types.ObjectId(user.authId),
                    provider: new Types.ObjectId(traderSubscriptionDto.provider),
                    category: new Types.ObjectId(obj.category),
                    startDate: DateService.getDateDayStart(_startDate, _timezone),
                    endDate: DateService.getDateDayEnd(_endDate, _timezone),
                    amount: _amount,
                    duration: _find.duration
                }));
            }
            _total = _total + _amount;
        }
        if (_alreadyExist.length > 0) {
            throw new BadRequestException("Some of subscription already subscribed. Please check and try again.");
        }
        if (_total > _user.traderWallet) {
            return new SuccessResponse(`You do not have sufficient coins in your wallet. Please add ${_total - _user.traderWallet} more coins.`, { success: false, currentAmount: _user.traderWallet, needMore: _total - _user.traderWallet });
        }
        const _sl = _subscription.length;
        let _subscriptionId: any[] = [];
        let _categories: any[] = [];
        for (let i = 0; i < _sl; i++) {
            let obj = _subscription[i];
            await obj.save();
            _subscriptionId.push(obj._id);
            _categories.push(obj.category);
            await new this.transactionModel({
                auth: new Types.ObjectId(user.authId),
                role: RoleEnum.TRADER,
                amount: obj.amount,
                type: TransactionTypeEnum.DEBIT,
                transactionId: obj._id,
                for: TransactionForTypeEnum.SUBSCRIBE,
                status: TransactionStatusEnum.ACCEPTED
            }).save();
            await new this.transactionModel({
                auth: new Types.ObjectId(traderSubscriptionDto.provider),
                role: RoleEnum.PROVIDER,
                amount: obj.amount,
                type: TransactionTypeEnum.CREDIT,
                transactionId: obj._id,
                for: TransactionForTypeEnum.SUBSCRIBE,
                status: TransactionStatusEnum.ACCEPTED
            }).save();
        }
        await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $inc: { traderWallet: -_total } }).exec();
        await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(traderSubscriptionDto.provider) }, { $inc: { providerWallet: _total } }).exec();
        this.newSubscriberPostNotification(user.authId, traderSubscriptionDto.provider, _subscriptionId, _categories);
        return new SuccessResponse("Subscription completed successfully.");
    }
    async deleteSubscription(id: any, user: IUser) {
        const _doc = await this.subscriptionModel.findOneAndUpdate({ _id: new Types.ObjectId(id), auth: new Types.ObjectId(user.authId) }, { $set: { status: SubscriptionStatusEnum.INACTIVE } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Unsubscribe successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async Umsubscription(unsubscribeDto: UnsubscribeDto, user: IUser) {
        const _doc = await this.subscriptionModel.findOneAndUpdate({ _id: { $in: unsubscribeDto.subscription }, auth: new Types.ObjectId(user.authId) }, { $set: { status: SubscriptionStatusEnum.INACTIVE } }, { runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse("Unsubscribe successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async getSearchSignals(searchDto: SearchTraderSignalDto, user: IUser) {
        let _match = { status: searchDto.status };
        if (searchDto.category) {
            _match["category"] = new Types.ObjectId(searchDto.category)
        }
        if (searchDto.search) {
            _match['title'] = { $regex: new RegExp(`${searchDto.search}`, "ig") };
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        if (searchDto.status == SignalStatusEnum.OPEN) {
            query.push(PipelineService.lookupWithLet('subscriptions', { 'category': '$category', 'provider': '$auth' }, 'subscriptions', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$provider', '$$provider'] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] }, auth: new Types.ObjectId(user.authId) }] })
            ]));
            query.push(PipelineService.match({ $expr: { $ne: [{ $size: "$subscriptions" }, 0] } }));
        }
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.lookup('users', 'auth', 'auth', 'provider', [PipelineService.project({ firstName: 1, lastName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: '$auth', _id: 0 })]),
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.lookupWithLet('my-trades', { 'signal': '$_id' }, 'mytrade', [
                        PipelineService.match({ $and: [{ "$expr": { $eq: ['$signal', '$$signal'] } }, { auth: new Types.ObjectId(user.authId) }] })
                    ]),
                    PipelineService.project({ title: 1, type: 1, duration: 1, entry: 1, stoploss: 1, target: 1, status: 1, targetHit: 1, stoplossHit: 1, createdAt: 1, comment: { $size: "$comment" }, provider: { $first: '$provider' }, category: { $first: '$category' }, mark: PipelineService.condition({ $eq: [{ $size: "$mytrade" }, 0] }, false, true), id: "$_id", _id: 0 })
                ]
            }
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }));
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        return new SuccessResponse("Provider signals fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getSubscription(searchDto: SearchTraderSubscriptionDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(user.authId), status: searchDto.status })];
        query.push(PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]));
        query.push(PipelineService.project({ provider: 1, category: { $first: "$category" }, status: 1, startDate: 1, endDate: 1, amount: 1, duration: 1 }));
        query.push(PipelineService.group({
            _id: "$provider",
            plans: {
                $push: {
                    category: "$category",
                    status: "$status",
                    startDate: "$startDate",
                    endDate: "$endDate",
                    amount: "$amount",
                    duration: "$duration",
                }
            },
            cost: {
                $sum: {
                    $round: [PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.YEARLY] }, { $divide: ["$amount", 12] },
                        PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.HALFYEARLY] }, { $divide: ["$amount", 6] },
                            PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.QUARTERLY] }, { $divide: ["$amount", 3] }, "$amount")
                        )), 2]
                }
            }
        }));
        let _filterQuery: any[] = [];
        if (searchDto.search) {
            _filterQuery.push(PipelineService.match({ firstName: { $regex: new RegExp(`${searchDto.search}`, "ig") } }))
        }
        query.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
            ..._filterQuery,
            PipelineService.lookupWithLet('subscriptions', { 'provider': '$auth' }, 'subscription', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$provider', '$$provider'] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                PipelineService.group({
                    _id: "$auth"
                })
            ]),
            PipelineService.lookupWithLet('signals', { 'provider': '$auth', 'createdAt': { $arrayElemAt: ["$provider.createdAt", 0] } }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$auth', '$$provider'] } }, { active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
            ]),
            PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, _id: "$auth", totalSubscriber: { $size: '$subscription' }, signal: { $first: '$signal' }, image: PipelineService.file('images/profile', '$image') })
        ]));
        if (searchDto.search) {
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
        }
        query.push(PipelineService.project({ provider: { $first: "$provider" }, plans: 1, cost: 1, _id: 0 }));
        let _res: any[] = await this.subscriptionModel.aggregate(query).exec();
        return new SuccessResponse("Subscriptions fetch successfully.", _res);
    }
    async getAllTrader(searchDto: SearchTraderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.TRADER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.search) {
            let _match: any = {};
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'trader', [
                PipelineService.match(_match),
                PipelineService.lookup('subscriptions', 'auth', 'auth', 'subscription', [
                    PipelineService.match({ status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }),
                    PipelineService.group({
                        _id: "$category",
                        total: { $sum: 1 },
                        cost: {
                            $sum: {
                                $round: [PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.YEARLY] }, { $divide: ["$amount", 12] },
                                    PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.HALFYEARLY] }, { $divide: ["$amount", 6] },
                                        PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.QUARTERLY] }, { $divide: ["$amount", 3] }, "$amount")
                                    )), 2]
                            }
                        }
                    }),
                    PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.group({
                        _id: null,
                        following: { $sum: "$total" },
                        cost: { $sum: "$cost" },
                        category: {
                            $push: {
                                $first: "$category.name"
                            }
                        }
                    }),
                    PipelineService.project({ following: 1, category: 1, cost: 1, _id: 0 })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$traderWallet", image: PipelineService.file('images/profile', '$image'), subscription: { $first: "$subscription" }, _id: 0 })
            ]));
            query.push(PipelineService.match({ "trader": { $size: 1 } }));
            _filterQuery.push(PipelineService.project({ trader: { $first: "$trader" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'trader', [
                PipelineService.lookup('subscriptions', 'auth', 'auth', 'subscription', [
                    PipelineService.match({ status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }),
                    PipelineService.group({
                        _id: "$category",
                        total: { $sum: 1 },
                        cost: {
                            $sum: {
                                $round: [PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.YEARLY] }, { $divide: ["$amount", 12] },
                                    PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.HALFYEARLY] }, { $divide: ["$amount", 6] },
                                        PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.QUARTERLY] }, { $divide: ["$amount", 3] }, "$amount")
                                    )), 2]
                            }
                        }
                    }),
                    PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.group({
                        _id: null,
                        following: { $sum: "$total" },
                        cost: { $sum: "$cost" },
                        category: {
                            $push: {
                                $first: "$category.name"
                            }
                        }
                    }),
                    PipelineService.project({ following: 1, category: 1, cost: 1, _id: 0 })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$traderWallet", image: PipelineService.file('images/profile', '$image'), subscription: { $first: "$subscription" }, _id: 0 })]));
            _filterQuery.push(PipelineService.project({ trader: { $first: "$trader" } }));
        }
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    ..._filterQuery
                ],
            },
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.authModel.aggregate(query).exec();
        return new SuccessResponse("Provider fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getTraderDetail(id: any, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(id) })];
        query.push(PipelineService.lookupWithLet('categories', { 'cid': '$traderInterest' }, 'interest', [
            PipelineService.match({ "$expr": { $in: ["$_id", "$$cid"] } }),
            PipelineService.project({ name: 1, description: 1 })
        ]));
        query.push(PipelineService.lookup('subscriptions', 'auth', 'auth', 'subscriptions', [
            PipelineService.match({ status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }),
            PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]),
            PipelineService.lookup('users', 'provider', 'auth', 'provider', [PipelineService.project({ firstName: 1, lastName: 1, status: 1, image: PipelineService.file('images/profile', '$image') })]),
            PipelineService.project({ category: { $first: "$category" }, provider: { $first: "$provider" }, startDate: 1, endDate: 1, amount: 1, duration: 1 })
        ]));
        query.push(PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$traderWallet", interest: 1, subscriptions: 1, image: PipelineService.file('images/profile', '$image') }));
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return new SuccessResponse("Trader details fetch successfully.", _res[0]);
    }
    async getProviderSignals(id: any, searchDto: SearchTraderSignalDto, user: IUser) {
        let _match = { auth: new Types.ObjectId(id), status: searchDto.status };
        if (searchDto.category) {
            _match["category"] = new Types.ObjectId(searchDto.category)
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        if (searchDto.status == SignalStatusEnum.OPEN) {
            query.push(PipelineService.lookupWithLet('subscriptions', { 'category': '$category', 'provider': '$auth' }, 'subscriptions', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { "$expr": { $eq: ['$provider', '$$provider'] } }, { status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] }, auth: new Types.ObjectId(user.authId) }] })
            ]));
            query.push(PipelineService.match({ $expr: { $ne: [{ $size: "$subscriptions" }, 0] } }));
        }
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.lookupWithLet('my-trades', { 'signal': '$_id' }, 'mytrade', [
                        PipelineService.match({ $and: [{ "$expr": { $eq: ['$signal', '$$signal'] } }, { auth: new Types.ObjectId(user.authId) }] })
                    ]),
                    PipelineService.project({ title: 1, type: 1, duration: 1, entry: 1, stoploss: 1, target: 1, status: 1, targetHit: 1, stoplossHit: 1, createdAt: 1, comment: { $size: "$comment" }, category: { $first: '$category' }, mark: PipelineService.condition({ $eq: [{ $size: "$mytrade" }, 0] }, false, true), id: "$_id", _id: 0 })
                ]
            }
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }));
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        return new SuccessResponse("Provider signals fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getProviderDetails(id: any, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(id) })];
        query.push(PipelineService.lookupWithLet('subscription-plans', { 'auth': '$auth', createdAt: '$createdAt' }, 'plans', [
            PipelineService.match({ $and: [{ "$expr": { $eq: ['$auth', '$$auth'] } }, { active: true }] }),
            PipelineService.lookupWithLet('subscriptions', { 'category': '$category' }, 'subscription', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { provider: new Types.ObjectId(id), status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    subscription: {
                        $push: PipelineService.condition({ $eq: ['$auth', new Types.ObjectId(user.authId)] }, { status: '$status', startDate: '$startDate', endDate: '$endDate', amount: '$amount', duration: '$duration', _id: '$_id' }, '$$REMOVE')
                    }
                }),
                PipelineService.project({ total: 1, subscription: { $first: '$subscription' }, _id: 0 })
            ]),
            PipelineService.lookupWithLet('signals', { 'category': '$category' }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { auth: new Types.ObjectId(id), active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, average: PipelineService.average('$total', { $dateDiff: { startDate: "$$createdAt", endDate: new Date(), unit: "day" } }, 0), _id: 0 })
            ]),
            PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]),
            PipelineService.project({ monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, category: { $first: '$category' }, totalSubscriber: { $arrayElemAt: ["$subscription.total", 0] }, subscription: { $arrayElemAt: ["$subscription.subscription", 0] }, signal: { $first: '$signal' } }),
            PipelineService.sort("subscription", SortOrderEnum.DESCENDING)
        ]));
        query.push(PipelineService.project({ firstName: 1, lastName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), plans: 1 }))
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return new SuccessResponse("Provider details fetch successfully.", _res[0]);
    }
    async getSignalCommnet(id: string, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $and: [{ _id: new Types.ObjectId(id) }, { $expr: { $gt: [{ $size: "$comment" }, 0] } }] })];
        query.push(PipelineService.unwind("comment"));
        query.push(PipelineService.lookup('signal-comment-views', 'comment._id', 'comment', 'view', [{ $count: "total" }]));
        query.push(PipelineService.project({ id: "$comment._id", message: "$comment.message", createdAt: "$comment.createdAt", view: { $first: "$view" }, _id: 0 }));
        // const _doc = await this.signalModel.findOne({ _id: new Types.ObjectId(id) }, { comment: 1, createdAt: 1 }).exec();
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        this.addViewForSignalComment(id, user.authId, _res);
        return new SuccessResponse('Signal Comment get successfully.', _res);
    }
    async markAsTrade(id: any, user: IUser) {
        const _doc = await this.myTradeModel.findOneAndDelete({ auth: new Types.ObjectId(user.authId), signal: new Types.ObjectId(id) }).exec();
        if (_doc) {
            return new SuccessResponse("Remove Mark as trade successfully.");
        }
        else {
            await new this.myTradeModel({ auth: new Types.ObjectId(user.authId), signal: new Types.ObjectId(id) }).save();
            return new SuccessResponse("Mark as trade successfully.");
        }
    }
    async getMyTradeSignal(searchDto: SearchTraderSignalDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(user.authId) })];
        let _filter: any = { status: searchDto.status };
        if (searchDto.category) {
            _filter["category"] = new Types.ObjectId(searchDto.category)
        }
        if (searchDto.search) {
            _filter['title'] = { $regex: new RegExp(`${searchDto.search}`, "ig") };
        }
        query.push(PipelineService.lookup('signals', 'signal', '_id', 'signal', [PipelineService.match(_filter)]));
        query.push(PipelineService.match({ $expr: { $eq: [{ $size: "$signal" }, 1] } }));
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.unwind('signal'),
                    PipelineService.lookup('categories', 'signal.category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]),
                    PipelineService.lookup('users', 'signal.auth', 'auth', 'provider', [PipelineService.project({ firstName: 1, lastName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image'), id: "$auth", _id: 0 })]),
                    PipelineService.project({ title: '$signal.title', type: '$signal.type', duration: '$signal.duration', entry: '$signal.entry', stoploss: '$signal.stoploss', target: '$signal.target', status: '$signal.status', targetHit: '$signal.targetHit', stoplossHit: '$signal.stoplossHit', createdAt: 1, comment: { $size: "$signal.comment" }, category: { $first: '$category' }, provider: { $first: '$provider' }, id: "$signal._id", _id: 0 })
                ]
            }
        });
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }));
        let _res: any[] = await this.myTradeModel.aggregate(query).exec();
        return new SuccessResponse("My trade fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async downloadAllTrader(searchDto: SearchTraderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.TRADER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.search) {
            let _match: any = {};
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'trader', [
                PipelineService.match(_match),
                PipelineService.lookup('subscriptions', 'auth', 'auth', 'subscription', [
                    PipelineService.match({ status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }),
                    PipelineService.group({
                        _id: "$category",
                        total: { $sum: 1 },
                        cost: {
                            $sum: {
                                $round: [PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.YEARLY] }, { $divide: ["$amount", 12] },
                                    PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.HALFYEARLY] }, { $divide: ["$amount", 6] },
                                        PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.QUARTERLY] }, { $divide: ["$amount", 3] }, "$amount")
                                    )), 2]
                            }
                        }
                    }),
                    PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.group({
                        _id: null,
                        following: { $sum: "$total" },
                        cost: { $sum: "$cost" },
                        category: {
                            $push: {
                                $first: "$category.name"
                            }
                        }
                    }),
                    PipelineService.project({ following: 1, category: 1, cost: 1, _id: 0 })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$traderWallet", image: PipelineService.file('images/profile', '$image'), subscription: { $first: "$subscription" }, _id: 0 })
            ]));
            query.push(PipelineService.match({ "trader": { $size: 1 } }));
            query.push(PipelineService.project({ trader: { $first: "$trader" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'trader', [
                PipelineService.lookup('subscriptions', 'auth', 'auth', 'subscription', [
                    PipelineService.match({ status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } }),
                    PipelineService.group({
                        _id: "$category",
                        total: { $sum: 1 },
                        cost: {
                            $sum: {
                                $round: [PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.YEARLY] }, { $divide: ["$amount", 12] },
                                    PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.HALFYEARLY] }, { $divide: ["$amount", 6] },
                                        PipelineService.condition({ $eq: ["$duration", SubscriptionPlanDurationEnum.QUARTERLY] }, { $divide: ["$amount", 3] }, "$amount")
                                    )), 2]
                            }
                        }
                    }),
                    PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.group({
                        _id: null,
                        following: { $sum: "$total" },
                        cost: { $sum: "$cost" },
                        category: {
                            $push: {
                                $first: "$category.name"
                            }
                        }
                    }),
                    PipelineService.project({ following: 1, category: 1, cost: 1, _id: 0 })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$traderWallet", image: PipelineService.file('images/profile', '$image'), subscription: { $first: "$subscription" }, _id: 0 })]));
            _filterQuery.push(PipelineService.project({ trader: { $first: "$trader" } }));
        }
        let _res: any[] = await this.authModel.aggregate([...query, ..._filterQuery]).exec();
        return DownloadService.traders(_res);
    }
    private async newSubscriberPostNotification(trader: any, provider: any, subscription: any[], category: any[]) {
        const _provider = await this.authModel.findOne({ _id: new Types.ObjectId(provider) }, { device: 1, role: 1 });
        const _trader = await this.userModel.findOne({ auth: new Types.ObjectId(trader) }, { firstName: 1, image: 1 });
        let _catIds = category.map((ele: any) => new Types.ObjectId(ele));
        const _categories = await this.categoryModel.find({ _id: { $in: _catIds } }, { name: 1 });
        const _categoriesName = _categories.map((ele: any) => ele.name).join(',');
        const _notificationText = `${_trader?.firstName} started following you in ${_categoriesName}`;
        const _notification: PushNotificationDto = {
            notification: {
                title: `New Following`,
                body: _notificationText
            },
            data: {
                type: NotificationTypeEnum.SUBSCRIBE,
                trader: trader.toString(),
                category: category.toString()
            }
        };
        if (_provider?.device && _provider?.role == RoleEnum.PROVIDER)
            this.firebaseService.sendPushNotification(_provider?.device.token, _notification);
        new this.notificationModel({ auth: new Types.ObjectId(provider), role: RoleEnum.PROVIDER, image: _trader.image, type: NotificationTypeEnum.SUBSCRIBE, text: _notificationText, data: { trader: trader, category: category, subscription: subscription } }).save();
    }
    private async addViewForSignalComment(signal: any, auth: any, comment: any[]) {
        const _cl = comment.length;
        for (let i = 0; i < _cl; i++) {
            const _doc = await this.signalCommentViewModel.findOne({ auth: new Types.ObjectId(auth), signal: new Types.ObjectId(signal), comment: new Types.ObjectId(comment[i].id) }).exec();
            if (!_doc) {
                new this.signalCommentViewModel({ auth: new Types.ObjectId(auth), signal: new Types.ObjectId(signal), comment: new Types.ObjectId(comment[i].id) }).save();
            }
        }
    }
}