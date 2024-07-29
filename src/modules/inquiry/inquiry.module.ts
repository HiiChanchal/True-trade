import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from 'src/services/inquiry.service';
import { AUTH_SCHEMA, INQUIRY_SCHEMA } from 'src/Schema';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
    imports: [MongooseModule.forFeature([INQUIRY_SCHEMA, AUTH_SCHEMA])],
    controllers: [InquiryController],
    providers: [InquiryService, FirebaseService],
    exports: []
})
export class AppInquiryModule { }