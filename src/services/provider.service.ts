import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { UserDocument, UserModel } from "src/Schema/user.schema";
import { ActiveDto, ProfileStatusDto } from "src/dto/user.dto";
import { SearchProviderDto } from "src/dto/admin.dto";
import { ProfileStatusEnum, RoleEnum } from "src/enum/role.enum";
import { PipelineService } from "./static/pipeline.service";
import { SortOrderEnum } from "src/enum/common.enum";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { PaginationResponse } from "src/model/pagination.model";
import { ProviderPlanDto, SearchProviderSubscriberDto, SubscriptionPlanDto } from "src/dto/subscription-plan.dto";
import { SubscriptionPlanDocument, SubscriptionPlanModel } from "src/Schema/subscription-plan.schema";
import { CategoryDocument, CategoryModel } from "src/Schema/category.schema";
import { SignalDocument, SignalModel } from "src/Schema/signal.schema";
import { CommentDto, SearchSignalDto, SignalDto, SignalStatusDto } from "src/dto/signal.dto";
import { SubscriptionDocument, SubscriptionModel } from "src/Schema/subscription.schema";
import { SignalStatusEnum } from "src/enum/signal.enum";
import { SubscriptionStatusEnum } from "src/enum/subscription.enum";
import { FirebaseService } from "./firebase.service";
import { PushNotificationDto } from "src/dto/firebase.dto";
import { NotificationDocument, NotificationModel } from "src/Schema/notification.schema";
import { NotificationTypeEnum } from "src/enum/notification.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProfileEventEnum, SignalEventEnum } from "src/enum/event.enum";
import { DownloadService } from "./static/download.service";
@Injectable()
export class ProviderService {
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(SubscriptionPlanModel.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
        @InjectModel(SignalModel.name) private signalModel: Model<SignalDocument>,
        @InjectModel(SubscriptionModel.name) private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel(NotificationModel.name) private notificationModel: Model<NotificationDocument>,
        private firebaseService: FirebaseService, private eventEmitter: EventEmitter2) { }
    async profileStatus(id: any, profileStatusDto: ProfileStatusDto, user: IUser) {
        let _selfie = {};
        if (profileStatusDto.status == ProfileStatusEnum.REJECTED) {
            _selfie['selfie'] = null;
        }
        const _doc = await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(id) }, { $set: { ...profileStatusDto, ..._selfie, updatedBy: user.authId } }, { runValidators: true }).exec();
        if (_doc) {
            this.profileStatusNotification(id, profileStatusDto.status);
            return new SuccessResponse("Provider Status update successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async getAllProvider(searchDto: SearchProviderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.PROVIDER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.status || searchDto.search) {
            let _match: any = {};
            if (searchDto.status) {
                _match['status'] = searchDto.status;
            }
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.match(_match),
                PipelineService.lookup('signals', 'auth', 'auth', 'signal', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 },
                        win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                        loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                    }),
                    PipelineService.project({ total: 1, win: 1, loss: 1, _id: 0 })
                ]),
                PipelineService.lookup('subscription-plans', 'auth', 'auth', 'plans', [
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ name: { $first: "$category.name" } })
                ]),
                PipelineService.lookup('subscriptions', 'auth', 'provider', 'subscription', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 }
                    })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, subscription: { $first: "$subscription.total" }, signal: { $first: "$signal" }, service: "$plans.name", wallet: "$providerWallet", withdraw: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })
            ]));
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.lookup('signals', 'auth', 'auth', 'signal', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 },
                        win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                        loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                    }),
                    PipelineService.project({ total: 1, win: 1, loss: 1, _id: 0 })
                ]),
                PipelineService.lookup('subscription-plans', 'auth', 'auth', 'plans', [
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ name: { $first: "$category.name" } })
                ]),
                PipelineService.lookup('subscriptions', 'auth', 'provider', 'subscription', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 }
                    })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, subscription: { $first: "$subscription.total" }, signal: { $first: "$signal" }, service: "$plans.name", wallet: "$providerWallet", withdraw: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
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
    async getAllProviderForVerification(searchDto: SearchProviderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.PROVIDER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.status || searchDto.search) {
            let _match: any = {};
            if (searchDto.status) {
                _match['status'] = searchDto.status == ProfileStatusEnum.PENDING ? { $in: [ProfileStatusEnum.PENDING, ProfileStatusEnum.PROCEED] } : searchDto.status;
            }
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            if (searchDto.status == ProfileStatusEnum.PENDING) {
                _match["selfie"] = { "$nin": [null, ""] };
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.match(_match),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })
            ]));
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
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
    async getProviderDetail(id: any, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(id) })];
        query.push(PipelineService.lookupWithLet('categories', { 'cid': '$providerInterest' }, 'interest', [
            PipelineService.match({ "$expr": { $in: ["$_id", "$$cid"] } }),
            PipelineService.project({ name: 1, description: 1 })
        ]));
        query.push(PipelineService.lookup('subscription-plans', 'auth', 'auth', 'plans', [
            PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]),
            PipelineService.project({ category: { $first: "$category" }, monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1 })
        ]));
        query.push(PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, wallet: "$providerWallet", reason: 1, interest: 1, plans: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image') }));
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return new SuccessResponse("Provider details fetch successfully.", _res[0]);
    }
    async plans(providerPlanDto: ProviderPlanDto, user: IUser) {
        const _planCount = providerPlanDto.plans.length;
        let _createdPlans: any[] = [];
        for (let i = 0; i < _planCount; i++) {
            const _plan: SubscriptionPlanDto = providerPlanDto.plans[i];
            let _doc = await this.subscriptionPlanModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId), category: new Types.ObjectId(_plan.category) }, { $set: { ..._plan, updatedBy: user.authId } }, { runValidators: true, new: true }).exec();
            if (!_doc) {
                _doc = await new this.subscriptionPlanModel({ ..._plan, auth: new Types.ObjectId(user.authId), createdBy: user.authId }).save();
            }
            _createdPlans.push(_doc);
        }
        this.authModel.findOneAndUpdate({ _id: new Types.ObjectId(user.authId), providerAlso: false }, { $set: { providerAlso: true } }).exec();
        return new SuccessResponse("Plan created successfully.", _createdPlans);
    }
    async getPlans(user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(user.authId) })];
        query.push(PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1, description: 1 })]));
        query.push(PipelineService.project({ category: { $first: "$category" }, monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, active: 1 }))
        const res: any = await this.subscriptionPlanModel.aggregate(query).exec();
        return new SuccessResponse("Plan get successfully.", res);
    }
    async deletePlan(id: any, user: IUser) {
        const _doc: any = await this.subscriptionPlanModel.findOneAndDelete({ _id: new Types.ObjectId(id), auth: new Types.ObjectId(user.authId) });
        // await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId) }, { $pull: { providerInterest: _doc.category } });
        if (_doc) {
            return new SuccessResponse("Plan deleted successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to delete does not exist.");
        }
    }
    async signal(signalDto: SignalDto, user: IUser) {
        const _doc = await new this.signalModel({ ...signalDto, auth: new Types.ObjectId(user.authId) }).save();
        this.newSignalPostNotification(_doc._id, user.authId, signalDto.category);
        return new SuccessResponse("Signal created successfully.");
    }
    async signalStatus(id: string, signalStatusDto: SignalStatusDto) {
        const _doc = await this.signalModel.findByIdAndUpdate(id, { $set: { status: signalStatusDto.status } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse('Signal Status Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async plansStatus(id: string, activeDto: ActiveDto, user: IUser) {
        const _doc = await this.subscriptionPlanModel.findOneAndUpdate({ _id: new Types.ObjectId(id), auth: new Types.ObjectId(user.authId) }, { $set: { active: activeDto.active } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return new SuccessResponse('Plans Status Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async signalCommnet(id: string, commentDto: CommentDto, user: IUser) {
        const _doc = await this.signalModel.findOneAndUpdate({ _id: id, auth: new Types.ObjectId(user.authId) }, { $push: { comment: commentDto } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(SignalEventEnum.COMMENT, { signal: _doc._id, provider: _doc.auth, category: _doc.category });
            return new SuccessResponse('Comment Post Successfully.', _doc.comment.pop());
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async getSignals(searchDto: SearchSignalDto, user: IUser) {
        let _match: any = { auth: new Types.ObjectId(user.authId), status: searchDto.status };
        if (searchDto.category) {
            _match.category = new Types.ObjectId(searchDto.category)
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                    PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                    PipelineService.limit(searchDto.pageSize),
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ title: 1, type: 1, duration: 1, entry: 1, stoploss: 1, target: 1, status: 1, createdAt: 1, targetHit: 1, stoplossHit: 1, category: { $first: "$category" }, comment: { $size: '$comment' } })
                ]
            }
        })
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        return new SuccessResponse("Signal fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async getSignalCommnet(id: string, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $and: [{ _id: new Types.ObjectId(id) }, { $expr: { $gt: [{ $size: "$comment" }, 0] } }] })];
        query.push(PipelineService.unwind("comment"));
        query.push(PipelineService.lookup('signal-comment-views', 'comment._id', 'comment', 'view', [{ $count: "total" }]));
        query.push(PipelineService.project({ id: "$comment._id", message: "$comment.message", createdAt: "$comment.createdAt", view: { $first: "$view" }, _id: 0 }));
        let _res: any[] = await this.signalModel.aggregate(query).exec();
        // const _doc = await this.signalModel.findOne({ _id: new Types.ObjectId(id), auth: new Types.ObjectId(user.authId) }, { comment: 1, createdAt: 1 }).exec();
        return new SuccessResponse('Signal Comment get successfully.', _res);
    }
    async getSubscriber(searchDto: SearchProviderSubscriberDto, user: IUser) {
        let _match: any = { provider: new Types.ObjectId(user.authId), status: searchDto.status };
        if (searchDto.category) {
            _match["category"] = new Types.ObjectId(searchDto.category);
        }
        let query: PipelineStage[] = [PipelineService.match(_match)];
        if (searchDto.category) {
            query.push({
                $facet: {
                    count: [{ $count: "total" }],
                    data: [
                        PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                        PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                        PipelineService.limit(searchDto.pageSize),
                        PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                        PipelineService.lookup('users', 'auth', 'auth', 'trader', [PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image') })]),
                        PipelineService.project({ status: 1, startDate: 1, endDate: 1, amount: 1, duration: 1, createdAt: 1, category: { $first: "$category" }, trader: { $first: '$trader' } })
                    ]
                }
            });
        }
        else {
            query.push(PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]));
            query.push(PipelineService.group({
                _id: "$auth",
                category: {
                    $push: { $first: "$category" }
                },
                status: { $first: "$status" },
                startDate: { $first: "$startDate" },
                endDate: { $first: "$endDate" },
                amount: { $first: "$amount" },
                duration: { $first: "$duration" },
                createdAt: { $first: "$createdAt" },
            }));
            query.push({
                $facet: {
                    count: [{ $count: "total" }],
                    data: [
                        PipelineService.sort('createdAt', SortOrderEnum.DESCENDING),
                        PipelineService.skip(searchDto.currentPage, searchDto.pageSize),
                        PipelineService.limit(searchDto.pageSize),
                        PipelineService.lookup('users', '_id', 'auth', 'trader', [PipelineService.project({ firstName: 1, username: 1, status: 1, image: PipelineService.file('images/profile', '$image') })]),
                        PipelineService.project({ status: 1, startDate: 1, endDate: 1, amount: 1, duration: 1, createdAt: 1, category: 1, trader: { $first: '$trader' } })
                    ]
                }
            });
        }
        query.push(PipelineService.project({
            data: 1,
            count: { $first: "$count" }
        }))
        let _res: any[] = await this.subscriptionModel.aggregate(query).exec();
        return new SuccessResponse("Subscriber fetch successfully.", new PaginationResponse(_res[0].data, _res[0].count?.total || 0, searchDto.currentPage, searchDto.pageSize));
    }
    async signalTargetHit(id: string, user: IUser) {
        const _doc = await this.signalModel.findOneAndUpdate({ _id: new Types.ObjectId(id), targetHit: false, stoplossHit: false, active: true }, { $set: { targetHit: true, status: SignalStatusEnum.CLOSED } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            this.signalUpdateNotification(_doc._id, _doc.auth, _doc.category, `${_doc.title} hit the target`);
            return new SuccessResponse('Signal Target Hit Updated Successfully', _doc);
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async signalStoplossHit(id: string, user: IUser) {
        const _doc = await this.signalModel.findOneAndUpdate({ _id: new Types.ObjectId(id), targetHit: false, stoplossHit: false, active: true }, { $set: { stoplossHit: true, status: SignalStatusEnum.CLOSED } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            this.signalUpdateNotification(_doc._id, _doc.auth, _doc.category, `${_doc.title} hit the stoploss`);
            return new SuccessResponse('Signal Stoploss Hit Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async signalNotActive(id: string, user: IUser) {
        const _doc = await this.signalModel.findOneAndUpdate({ _id: new Types.ObjectId(id), targetHit: false, stoplossHit: false, active: true }, { $set: { active: false, status: SignalStatusEnum.CLOSED } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            this.signalUpdateNotification(_doc._id, _doc.auth, _doc.category, `${_doc.title} is closed`);
            return new SuccessResponse('Signal not Active Updated Successfully', _doc)
        } throw new BadRequestException('The resource you are trying to update does not exist.')
    }
    async getEarning(user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ auth: new Types.ObjectId(user.authId) })];
        query.push(PipelineService.lookup('subscriptions', 'auth', 'provider', 'subscription', [
            PipelineService.group({
                _id: "$category",
                subscriber: { $sum: 1 },
                earning: { $sum: "$amount" }
            }),
            PipelineService.lookupWithLet('signals', { 'category': '$_id' }, 'signal', [
                PipelineService.match({ $and: [{ "$expr": { $eq: ['$category', '$$category'] } }, { auth: new Types.ObjectId(user.authId), active: true }] }),
                PipelineService.group({
                    _id: null,
                    total: { $sum: 1 },
                    win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                    loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                }),
                PipelineService.project({ total: 1, win: 1, loss: 1, _id: 0 })
            ]),
            PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
            PipelineService.project({ subscriber: 1, earning: 1, signal: { $first: '$signal' }, category: { $first: '$category' }, _id: 0 })
        ]));
        query.push(PipelineService.project({ firstName: 1, image: PipelineService.file('images/profile', '$image'), wallet: "$providerWallet", withdraw: 1, subscription: 1 }));
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return new SuccessResponse("Provider Earnings Fetch successfully.", _res[0]);
    }
    async downloadAllProvider(searchDto: SearchProviderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.PROVIDER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.status || searchDto.search) {
            let _match: any = {};
            if (searchDto.status) {
                _match['status'] = searchDto.status;
            }
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.match(_match),
                PipelineService.lookup('signals', 'auth', 'auth', 'signal', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 },
                        win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                        loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                    }),
                    PipelineService.project({ total: 1, win: 1, loss: 1, _id: 0 })
                ]),
                PipelineService.lookup('subscription-plans', 'auth', 'auth', 'plans', [
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ name: { $first: "$category.name" } })
                ]),
                PipelineService.lookup('subscriptions', 'auth', 'provider', 'subscription', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 }
                    })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, subscription: { $first: "$subscription.total" }, signal: { $first: "$signal" }, service: "$plans.name", wallet: "$providerWallet", withdraw: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })
            ]));
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.lookup('signals', 'auth', 'auth', 'signal', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 },
                        win: { $sum: PipelineService.condition({ $eq: ['$targetHit', true] }, 1, 0) },
                        loss: { $sum: PipelineService.condition({ $eq: ['$stoplossHit', true] }, 1, 0) }
                    }),
                    PipelineService.project({ total: 1, win: 1, loss: 1, _id: 0 })
                ]),
                PipelineService.lookup('subscription-plans', 'auth', 'auth', 'plans', [
                    PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ name: { $first: "$category.name" } })
                ]),
                PipelineService.lookup('subscriptions', 'auth', 'provider', 'subscription', [
                    PipelineService.group({
                        _id: null,
                        total: { $sum: 1 }
                    })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, subscription: { $first: "$subscription.total" }, signal: { $first: "$signal" }, service: "$plans.name", wallet: "$providerWallet", withdraw: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        let _res: any[] = await this.authModel.aggregate([...query, ..._filterQuery]).exec();
        return DownloadService.providers(_res);
    }
    async downloadAllProviderForVerification(searchDto: SearchProviderDto, user: IUser) {
        let query: PipelineStage[] = [PipelineService.match({ $or: [{ role: RoleEnum.PROVIDER }, { providerAlso: true }] })];
        let _filterQuery: any[] = [];
        if (searchDto.status || searchDto.search) {
            let _match: any = {};
            if (searchDto.status) {
                _match['status'] = searchDto.status == ProfileStatusEnum.PENDING ? { $in: [ProfileStatusEnum.PENDING, ProfileStatusEnum.PROCEED] } : searchDto.status;
            }
            if (searchDto.search) {
                _match['firstName'] = {
                    $regex: new RegExp(`${searchDto.search}`, "ig"),
                }
            }
            if (searchDto.status == ProfileStatusEnum.PENDING) {
                _match["selfie"] = { "$nin": [null, ""] };
            }
            query.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.match(_match),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })
            ]));
            query.push(PipelineService.match({ "provider": { $size: 1 } }));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        else {
            _filterQuery.push(PipelineService.lookup('users', '_id', 'auth', 'provider', [
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, status: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })]));
            _filterQuery.push(PipelineService.project({ provider: { $first: "$provider" } }));
        }
        let _res: any[] = await this.authModel.aggregate([...query, ..._filterQuery]).exec();
        return DownloadService.providersForVerification(_res, searchDto.status);
    }
    private async newSignalPostNotification(signal: any, provider: any, category: any) {
        let query: PipelineStage[] = [PipelineService.match({ provider: new Types.ObjectId(provider), category: new Types.ObjectId(category), status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } })];
        query.push(PipelineService.lookup('users', 'provider', 'auth', 'provider', [PipelineService.project({ firstName: 1, image: 1 })]));
        query.push(PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]));
        query.push(PipelineService.lookup('auths', 'auth', '_id', 'auth', [PipelineService.project({ device: 1, role: 1 })]));
        query.push(PipelineService.project({ provider: { $first: "$provider" }, category: { $first: "$category" }, auth: { $first: "$auth" } }));
        let _res: any[] = await this.subscriptionModel.aggregate(query).exec();
        const _length: number = _res.length;
        const _firstRecord = _res[0];
        const _notificationText = `${_firstRecord?.provider?.firstName} posted a trade in ${_firstRecord?.category?.name}`;
        const _notification: PushNotificationDto = {
            notification: {
                title: `New Signal Post`,
                body: _notificationText
            },
            data: {
                type: NotificationTypeEnum.SIGNAL,
                signal: signal.toString(),
                provider: provider.toString(),
                category: category.toString()
            }
        };
        for (let i = 0; i < _length; i++) {
            const _ele = _res[i];
            this.eventEmitter.emit(SignalEventEnum.CREATED, { user: _ele.auth._id, signal: signal, provider: provider, category: category });
            if (_ele.auth.device && _ele.auth.role == RoleEnum.TRADER)
                this.firebaseService.sendPushNotification(_ele.auth.device.token, _notification);
            new this.notificationModel({ auth: new Types.ObjectId(_ele.auth._id), role: RoleEnum.TRADER, type: NotificationTypeEnum.SIGNAL, image: _ele.provider.image, text: _notificationText, data: { provider: provider, signal: signal, category: category } }).save();
        }
    }
    private async signalUpdateNotification(signal: any, provider: any, category: any, text: string) {
        let query: PipelineStage[] = [PipelineService.match({ provider: new Types.ObjectId(provider), category: new Types.ObjectId(category), status: { $in: [SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE] } })];
        // query.push(PipelineService.lookup('users', 'provider', 'auth', 'provider', [PipelineService.project({ firstName: 1, image: 1 })]));
        query.push(PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]));
        query.push(PipelineService.lookup('auths', 'auth', '_id', 'auth', [PipelineService.project({ device: 1, role: 1 })]));
        query.push(PipelineService.project({ category: { $first: "$category" }, auth: { $first: "$auth" } }));
        let _res: any[] = await this.subscriptionModel.aggregate(query).exec();
        const _length: number = _res.length;
        const _firstRecord = _res[0];
        const _notificationText = `${text} in ${_firstRecord?.category?.name}`;
        const _notification: PushNotificationDto = {
            notification: {
                title: `Signal Update`,
                body: _notificationText
            },
            data: {
                type: NotificationTypeEnum.SIGNAL,
                signal: signal.toString(),
                provider: provider.toString(),
                category: category.toString()
            }
        };
        for (let i = 0; i < _length; i++) {
            const _ele = _res[i];
            this.eventEmitter.emit(SignalEventEnum.UPDATED, { user: _ele.auth._id, signal: signal, provider: provider, category: category });
            if (_ele.auth.device && _ele.auth.role == RoleEnum.TRADER)
                this.firebaseService.sendPushNotification(_ele.auth.device.token, _notification);
            new this.notificationModel({ auth: new Types.ObjectId(_ele.auth._id), role: RoleEnum.TRADER, type: NotificationTypeEnum.SIGNAL, text: _notificationText, data: { provider: provider, signal: signal, category: category } }).save();
        }
    }
    private async profileStatusNotification(provider: any, status: string) {
        const _provider = await this.authModel.findById(provider).exec();
        const _notification: PushNotificationDto = {
            notification: {
                title: `Profile Status`,
                body: `Your profile verification has been ${status}.`
            },
            data: {
                type: NotificationTypeEnum.PROFILE,
                provider: provider.toString(),
                status: status
            }
        };
        this.eventEmitter.emit(ProfileEventEnum.STATUS, { user: provider, status: status });
        if (_provider.device?.token && _provider.role == RoleEnum.PROVIDER)
            this.firebaseService.sendPushNotification(_provider.device.token, _notification);
        new this.notificationModel({ auth: _provider._id, role: RoleEnum.PROVIDER, type: NotificationTypeEnum.PROFILE, text: `Your profile verification has been ${status}.`, data: { status: status } }).save();
    }
}