import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { catchError, firstValueFrom, map } from "rxjs";
const NodeRSA = require("node-rsa");
@Injectable()
export class AppleService {
    constructor(private readonly httpService: HttpService, private jwtService: JwtService) {
    }
    private async publicKeys() {
        return await firstValueFrom(this.httpService.get("https://appleid.apple.com/auth/keys").pipe(
            catchError((err: any) => { throw err }),
            map((res: any) => {
                return res.data.keys;
            })
        ));
    }
    async getAppleUser(token: any) {
        const keys: any = await this.publicKeys();
        const decodedToken = this.jwtService.decode(token, { complete: true });
        const kid = decodedToken.header.kid;
        const key = keys.find((k: any) => k.kid === kid);
        const pubKey = new NodeRSA({ b: 512 });
        pubKey.importKey(
            { n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') },
            'components-public'
        );
        const userKey = pubKey.exportKey('public');

        return this.jwtService.verify(token, {
            secret: userKey,
            algorithms: ['RS256'],
        });
    };
}