import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SUBSCRIPTION_SCHEMA } from 'src/Schema';
import { SchedulerService } from 'src/services/scheduler.service';

@Module({
    imports: [MongooseModule.forFeature([SUBSCRIPTION_SCHEMA])],
    providers: [SchedulerService]
})
export class AppSchedulerModule { }