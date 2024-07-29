import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { AdminDocument, AdminModel } from "src/Schema/admin.schema";
import { AuthDocument, AuthModel } from "src/Schema/auth.schema";
import { LoginDocument, LoginModel } from "src/Schema/login.schema";
import { UserDocument, UserModel } from "src/Schema/user.schema";
import { AppConfigService } from "./config.service";
import { ProfileStatusEnum, RoleEnum } from "src/enum/role.enum";
import { SuccessResponse } from "src/model/success.model";
import { IUser } from "src/interface/user.interface";
import { PipelineService } from "./static/pipeline.service";
import { AdminDto } from "src/dto/admin.dto";
import { AuthDto, AuthEmailDto, SocialAuthDto } from "src/dto/auth.dto";
import { UtilityService } from "./static/utility.service";
import { TermsDto } from "src/dto/user.dto";
import { SendMailService } from "./sendmail.service";
import { DeviceDto } from "src/dto/device.dto";
import { EmailDto } from "src/dto/email.dto";
import { GoogleService } from "./google.service";
import { AppleService } from "./apple.service";
import { AvatarDocument, AvatarModel } from "src/Schema/avatar.schema";
import { TempAuthDocument, TempAuthModel } from "src/Schema/temp-auth.schema";
@Injectable()
export class AuthService {
    constructor(@InjectModel(LoginModel.name) private loginModel: Model<LoginDocument>,
        @InjectModel(AuthModel.name) private authModel: Model<AuthDocument>,
        @InjectModel(TempAuthModel.name) private tempAuthModel: Model<TempAuthDocument>,
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(AdminModel.name) private adminModel: Model<AdminDocument>,
        @InjectModel(AvatarModel.name) private avatarModel: Model<AvatarDocument>,
        private sendMailService: SendMailService, private googleService: GoogleService, private appleService: AppleService,
        private jwtService: JwtService, private appConfigService: AppConfigService) { }
    async registerAdmin(adminDto: AdminDto) {
        let _auth = await this.authModel.findOne({ username: adminDto.email.toLowerCase().trim() });
        if (_auth) {
            throw new BadRequestException("Email already register.");
        }
        _auth = await new this.authModel({ username: adminDto.email, password: adminDto.password, role: RoleEnum.ADMIN, verify: true }).save();
        await new this.adminModel({ auth: _auth._id, firstName: adminDto.firstName, lastName: adminDto.lastName, email: adminDto.email }).save();
        return new SuccessResponse("Successfully created.");
    }
    async adminSignin(user: IUser) {
        const login = await this.addloginDetail(user);
        user.loggedInId = login._id;
        return new SuccessResponse("Login successfully.", this.jwtService.sign(user, { expiresIn: this.appConfigService.adminExpireIn }));
    }
    async authCheck(emailDto: EmailDto) {
        let _expiry = new Date();
        _expiry.setMinutes(_expiry.getMinutes() + 10);
        let _code = UtilityService.verificationCode();
        if (emailDto.email == 'demo@truetrader.com') {
            _code = "4321";
        }
        let isNew: boolean = false;
        let _auth = await this.authModel.findOneAndUpdate({ username: emailDto.email }, { $set: { code: _code, expiry: _expiry } }, { new: true });
        if (!_auth) {
            let _temp = await this.tempAuthModel.findOneAndUpdate({ username: emailDto.email }, { $set: { code: _code, expiry: _expiry } }, { new: true });
            if (!_temp)
                await new this.tempAuthModel({ username: emailDto.email, code: _code, expiry: _expiry }).save();
            isNew = true;
        }
        //try{this.sendMailService.sendOtp(emailDto.email, _code);}catch(e){throw e;}
        return new SuccessResponse("A OTP sent to your email.", { isNew: isNew });
    }
    async login(authEmailDto: AuthEmailDto) {
        const _auth = await this.authModel.findOneAndUpdate({ username: authEmailDto.email, code: authEmailDto.password, expiry: { $gte: new Date() } }, { $set: { verify: true, expiry: new Date() } }).exec();
        if (_auth) {
            let user: IUser = {
                authId: _auth._id,
                role: _auth.role
            };
            const _login = await this.loginUser(user);
            return new SuccessResponse("Login successfully.", _login);
        }
        else {
            throw new BadRequestException("Otp is invalid or expired.");
        }
    }
    async newLogin(authEmailDto: AuthEmailDto) {
        const _tempAuth = await this.tempAuthModel.findOneAndUpdate({ username: authEmailDto.email, code: authEmailDto.password, expiry: { $gte: new Date() } }, { $set: { verify: true, expiry: new Date() } }).exec();
        if (_tempAuth) {
            const _avatar = await this.getRandomAvatar();
            let _auth = await new this.authModel({ username: authEmailDto.email, role: RoleEnum.TRADER }).save();
            await new this.userModel({ auth: _auth._id, email: authEmailDto.email, image: _avatar, status: ProfileStatusEnum.APPROVED }).save();
            let user: IUser = {
                authId: _auth._id,
                role: _auth.role
            };
            const _login = await this.loginUser(user);
            this.tempAuthModel.findOneAndDelete({ username: authEmailDto.email }).exec();
            return new SuccessResponse("Login successfully.", _login);
        }
        else {
            throw new BadRequestException("Otp is invalid or expired.");
        }
    }
    async googleLogin(socialAuthDto: SocialAuthDto) {
        const _res = await this.googleService.verify(socialAuthDto.token);
        let _auth = await this.authModel.findOneAndUpdate({ username: _res.email }, { $set: { verify: true } }).exec();
        if (!_auth) {
            const _avatar = await this.getRandomAvatar();
            _auth = await new this.authModel({ username: _res.email, role: RoleEnum.TRADER, verify: true }).save();
            await new this.userModel({ auth: _auth._id, email: _res.email, firstName: _res.name, image: _avatar, status: ProfileStatusEnum.APPROVED }).save();
        }
        let user: IUser = {
            authId: _auth._id,
            role: _auth.role
        };
        const _login = await this.loginUser(user);
        return new SuccessResponse("Login successfully.", _login);
    }
    async appleLogin(socialAuthDto: SocialAuthDto) {
        const _res = await this.appleService.getAppleUser(socialAuthDto.token);
        let _auth = await this.authModel.findOneAndUpdate({ username: _res.email }, { $set: { verify: true } }).exec();
        if (!_auth) {
            const _avatar = await this.getRandomAvatar();
            _auth = await new this.authModel({ username: _res.email, role: RoleEnum.TRADER, verify: true }).save();
            await new this.userModel({ auth: _auth._id, firstName: socialAuthDto.name, email: _res.email, image: _avatar, status: ProfileStatusEnum.APPROVED }).save();
        }
        let user: IUser = {
            authId: _auth._id,
            role: _auth.role
        };
        const _login = await this.loginUser(user);
        return new SuccessResponse("Login successfully.", _login);
    }
    async logout(user: IUser) {
        this.loginModel.findByIdAndUpdate(user.loggedInId, { $set: { isLoggedIn: false } }).exec();
        return new SuccessResponse("Signout successfully.");
    }
    async getLoginDetail(id: any) {
        return this.loginModel.findOne({ auth: new Types.ObjectId(id), isLoggedIn: true }, {}, { sort: { createdAt: -1 } }).exec();
    }
    async validate(authDto: AuthDto): Promise<any> {
        const authUser: any = await this.findByUsernameAndPassword(authDto);
        if (authUser) {
            const result: IUser = {
                authId: authUser._id,
                role: authUser.role
            };
            return result;
        }
        return null;
    }
    async myInfo(user: IUser) {
        if (user.role == RoleEnum.ADMIN) {
            let query: PipelineStage[] = [];
            query.push(PipelineService.match({ _id: new Types.ObjectId(user.authId) }));
            query.push(PipelineService.lookup('admins', '_id', 'auth', 'info', [PipelineService.project({ firstName: 1, lastName: 1, email: 1, image: PipelineService.file('images/profile', '$image'), _id: 0 })]))
            let _res: any[] = await this.authModel.aggregate(query).exec();
            return new SuccessResponse("My info fetch successfully.", _res[0]);
        }
        else {
            const _info = await this.userDetail(user);
            return new SuccessResponse("My info fetch successfully.", _info);
        }
    }
    async beAProvider(termsDto: TermsDto, user: IUser) {
        if (!termsDto.accept) {
            throw new BadRequestException("Please read and accept Terms and policy.");
        }
        // let query: PipelineStage[] = [PipelineService.match({ _id: new Types.ObjectId(user.authId) })]
        // query.push(PipelineService.lookup('subscriptions', '_id', 'auth', 'subscriptions', []));
        // query.push(PipelineService.lookup('users', '_id', 'auth', 'info', []));
        // let _res: any[] = await this.authModel.aggregate(query).exec();
        // let _expiry = new Date();
        // _expiry.setMinutes(_expiry.getMinutes() + 10);
        // const _code = UtilityService.verificationCode();
        // let isNew: boolean = false;
        const _auth = await this.authModel.findByIdAndUpdate(user.authId, { $set: { role: RoleEnum.PROVIDER } }, { runValidators: true, new: true }).exec();
        await this.userModel.findOneAndUpdate({ auth: new Types.ObjectId(user.authId), status: ProfileStatusEnum.APPROVED }, { $set: { status: ProfileStatusEnum.PENDING } }, { runValidators: true, new: true }).exec();
        // this.sendMailService.sendOtp(_res[0].username, _code);
        // return new SuccessResponse("A OTP sent to your email.", { isNew: isNew });
        let _user: IUser = {
            authId: _auth._id,
            role: _auth.role
        };
        const _login = await this.loginUser(_user);
        return new SuccessResponse("Be a provider successfully.", _login);
    }
    async switch(user: IUser) {
        const _auth = await this.authModel.findByIdAndUpdate(user.authId, { $set: { role: user.role == RoleEnum.TRADER ? RoleEnum.PROVIDER : RoleEnum.TRADER } }, { runValidators: true, new: true }).exec();
        if (_auth) {
            let _user: IUser = {
                authId: _auth._id,
                role: _auth.role
            };
            const _login = await this.loginUser(_user);
            return new SuccessResponse("Switch successfully.", _login);
        }
        else {
            throw new BadRequestException("Please try again.");
        }
    }
    async device(deviceDto: DeviceDto, user: IUser) {
        this.authModel.findByIdAndUpdate(user.authId, { $set: { device: deviceDto } }).exec();
        return new SuccessResponse("Device info update successfully.");
    }
    private async addloginDetail(user: IUser) {
        return new this.loginModel({ auth: new Types.ObjectId(user.authId), role: user.role }).save();
    }
    private async findByUsernameAndPassword(authDto: AuthDto) {
        const authUser = await this.authModel.findOne(authDto);
        if (authUser) {
            if (!authUser.active) {
                throw new BadRequestException("Your account has been deactivated. Please contact to admin.");
            }
            return authUser;
        }
        throw new BadRequestException("Invalid credentials.");
    }
    private async userDetail(user: IUser) {
        let query: PipelineStage[] = [];
        query.push(PipelineService.match({ _id: new Types.ObjectId(user.authId) }));
        if (user.role == RoleEnum.TRADER) {
            query.push(PipelineService.lookup('users', '_id', 'auth', 'info', [
                PipelineService.lookupWithLet('categories', { 'cid': '$traderInterest' }, 'interest', [
                    PipelineService.match({ "$expr": { $in: ["$_id", "$$cid"] } }),
                    PipelineService.project({ name: 1, description: 1 })
                ]),
                PipelineService.lookup("subscriptions", "auth", "auth", "subscription", [
                    PipelineService.group({
                        _id: "$category"
                    }),
                    PipelineService.lookup('categories', '_id', '_id', 'category', [PipelineService.project({ name: 1 })]),
                    PipelineService.project({ category: { $first: "$category" } })
                ]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, wallet: "$traderWallet", status: 1, interest: 1, image: PipelineService.file('images/profile', '$image'), subscription: "$subscription.category", _id: 0 })]))
        }
        if (user.role == RoleEnum.PROVIDER) {
            query.push(PipelineService.lookup('users', '_id', 'auth', 'info', [
                PipelineService.lookupWithLet('categories', { 'cid': '$providerInterest' }, 'interest', [
                    PipelineService.match({ "$expr": { $in: ["$_id", "$$cid"] } }),
                    PipelineService.project({ name: 1, description: 1 })
                ]),
                PipelineService.lookup("subscription-plans", "auth", "auth", "plans", [PipelineService.lookup('categories', 'category', '_id', 'category', [PipelineService.project({ name: 1 })]), PipelineService.project({ category: { $first: "$category" }, monthly: 1, quarterly: 1, halfYearly: 1, yearly: 1, active: 1 })]),
                PipelineService.project({ firstName: 1, lastName: 1, email: 1, username: 1, wallet: "$providerWallet", withdraw: 1, status: 1, interest: 1, plans: 1, selfie: PipelineService.file('images/selfie', '$selfie'), image: PipelineService.file('images/profile', '$image'), _id: 0 })]))
        }
        query.push(PipelineService.project({ role: 1, verify: 1, provider: "$providerAlso", info: { $first: "$info" }, _id: 0 }));
        let _res: any[] = await this.authModel.aggregate(query).exec();
        let _response: any = _res[0];
        _response.info["provider"] = _response.provider;
        return _response;
    }
    private async getRandomAvatar() {
        const _res: any[] = await this.avatarModel.aggregate([{ $sample: { size: 1 } }]).exec();
        return _res[0]?.name || null;
    }
    private async loginUser(user: IUser) {
        const login = await this.addloginDetail(user);
        user.loggedInId = login._id;
        const _token = this.jwtService.sign(user, { expiresIn: this.appConfigService.userExpireIn });
        const _info = await this.userDetail(user);
        return { token: _token, info: _info };
    }
}