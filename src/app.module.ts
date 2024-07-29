import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppAuthModule } from './modules/auth/auth.module';
import { AppSiteContentModule } from './modules/site-content/site-content.module';
import { ConfigModule } from '@nestjs/config';
import { AppDatabaseModule } from './modules/database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppInquiryModule } from './modules/inquiry/inquiry.module';
import { AppAdminModule } from './modules/admin/admin.module';
import { AppUserModule } from './modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppProviderModule } from './modules/provider/provider.module';
import { AppTraderModule } from './modules/trader/trader.module';
import { AppCategoryModule } from './modules/category/category.module';
import { AppSchedulerModule } from './modules/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppCommunicationModule } from './modules/communication/communication.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppMasterModule } from './modules/master/master.module';
import { AppTransactionModule } from './modules/transaction/transaction.module';

const MODULE = [
  AppAdminModule,
  AppAuthModule,
  AppCategoryModule,
  AppCommunicationModule,
  AppInquiryModule,
  AppMasterModule,
  AppProviderModule,
  AppSiteContentModule,
  AppTraderModule,
  AppTransactionModule,
  AppUserModule,
  AppSchedulerModule
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      }
    }),
    AppDatabaseModule.forRootConnection(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ...MODULE
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
