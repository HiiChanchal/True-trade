import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { PaymentMethodDocument, PaymentMethodModel } from "src/Schema/payment-method.schema";
import { PaymentMethodDto } from "src/dto/payment-method.dto";
import { ActiveDto } from "src/dto/user.dto";
import { IUser } from "src/interface/user.interface";
import { SuccessResponse } from "src/model/success.model";
import { PipelineService } from "./static/pipeline.service";
import { RoleEnum } from "src/enum/role.enum";


@Injectable()
export class MasterService {
    constructor(@InjectModel(PaymentMethodModel.name) private paymentMethodModel: Model<PaymentMethodDocument>) { }

    async createPaymentMethod(paymentMethodDto: PaymentMethodDto, filename: string, user: IUser) {
        let _data: any = { ...paymentMethodDto };
        if (filename) {
            _data['image'] = filename;
        }
        const _doc = await new this.paymentMethodModel({ ..._data, createdBy: user.authId }).save();
        if (_doc) {
            return new SuccessResponse("Payment Method added successfully.");
        }
        else {
            throw new BadRequestException("Payment Method not added.");
        }
    }
    async updatePaymentMethod(id: any, paymentMethodDto: PaymentMethodDto, filename: string, user: IUser) {
        let _data: any = { ...paymentMethodDto };
        if (filename) {
            _data['image'] = filename;
        }
        const _doc = await this.paymentMethodModel.findByIdAndUpdate(id, { $set: { ..._data, updatedBy: user.authId } }, { runValidators: true, new: true }).exec();
        if (_doc) {
            return new SuccessResponse("Payment Method updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async updatePaymentMethodStatus(id: any, activeDto: ActiveDto, user: IUser) {
        const _doc = await this.paymentMethodModel.findByIdAndUpdate(id, { $set: { ...activeDto, updatedBy: user.authId } }, { runValidators: true, new: true }).exec();
        if (_doc) {
            return new SuccessResponse("Payment Method updated successfully.");
        }
        else {
            throw new BadRequestException("The resource you are trying to update does not exist.");
        }
    }
    async getAllPaymentMethod() {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ role: { $ne: RoleEnum.PROVIDER } }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1, createdAt: 1, updatedAt: 1, active: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc)
    }
    async getPaymentMethodById(id: any) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ _id: new Types.ObjectId(id) }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1, createdAt: 1, updatedAt: 1, active: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc[0]);
    }
    async getAllUserPaymentMethod() {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ active: true, role: { $ne: RoleEnum.PROVIDER } }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc);
    }
    async getUserPaymentMethodById(id: any) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ _id: new Types.ObjectId(id) }));
        query.push(PipelineService.project({ title: 1, type: 1, image: PipelineService.file('images/pm', '$image'), upiId: 1, accountHolderName: 1, accountNumber: 1, bankName: 1, ifscCode: 1, countryCode: 1, phoneNumber: 1 }));
        const _doc = await this.paymentMethodModel.aggregate(query).exec();
        return new SuccessResponse('Payment Method fetch successfully.', _doc[0]);
    }
}