import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PAYMENT_METHOD_SCHEMA } from 'src/Schema';
import { MasterService } from 'src/services/master.service';
import { MasterController } from './master.controller';

@Module({
    imports: [MongooseModule.forFeature([PAYMENT_METHOD_SCHEMA])],
    controllers: [MasterController],
    providers: [MasterService],
    exports: []
})
export class AppMasterModule { }