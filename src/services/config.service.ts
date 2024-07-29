import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService) { }

    get jwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET');
    }
    get adminExpireIn(): string {
        return this.configService.get<string>('ADMIN_JWT_EXPIRE_IN');
    }
    get userExpireIn(): string {
        return this.configService.get<string>('USER_JWT_EXPIRE_IN');
    }
    get stripePublishableKey(): string {
        return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    }
    get stripeSecretKey(): string {
        return this.configService.get<string>('STRIPE_SECRET_KEY');
    }
    get stripeWebhookSecret(): string {
        return this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    }
    get googleAndroidClientId(): string {
        return this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID');
    }
    get googleIOSClientId(): string {
        return this.configService.get<string>('GOOGLE_IOS_CLIENT_ID');
    }
}