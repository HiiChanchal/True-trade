import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { AppConfigService } from "./config.service";
@Injectable()
export class GoogleService {
    googleClient: any;
    constructor(private appConfigService: AppConfigService) {
        this.googleClient = new OAuth2Client();
    }
    async verify(token: any) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken: token,
            audience: [this.appConfigService.googleAndroidClientId, this.appConfigService.googleIOSClientId]
        });
        return ticket.getPayload();
    }
}