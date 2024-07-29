import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { DateService } from './static/date.service';
import { SubscriptionDocument, SubscriptionModel } from 'src/Schema/subscription.schema';
import { SubscriptionStatusEnum } from 'src/enum/subscription.enum';

@Injectable()
export class SchedulerService {

    constructor(@InjectModel(SubscriptionModel.name) private subscriptionModel: Model<SubscriptionDocument>) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSubscriberStatus() {
        const _timezone = new Date().getTimezoneOffset();
        let _today = DateService.getDateDayStart(new Date(), _timezone);
        await this.subscriptionModel.updateMany({ status: SubscriptionStatusEnum.ACTIVE, endDate: { $lt: _today } }, { $set: { status: SubscriptionStatusEnum.EXPIRED } }, { runValidators: true });
        await this.subscriptionModel.updateMany({ status: SubscriptionStatusEnum.INACTIVE, endDate: { $lt: _today } }, { $set: { status: SubscriptionStatusEnum.UNSUBSCRIBE } }, { runValidators: true });
    }
}