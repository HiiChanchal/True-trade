import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from 'src/services/site-content.service';
import { SITE_CONTENT_SCHEMA } from 'src/Schema';

@Module({
    imports: [MongooseModule.forFeature([SITE_CONTENT_SCHEMA])],
    controllers: [SiteContentController],
    providers: [SiteContentService],
    exports: []
})
export class AppSiteContentModule { }