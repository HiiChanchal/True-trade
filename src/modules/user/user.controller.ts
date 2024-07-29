import { Body, Controller, Delete, Get, Param, Post, Put, Headers, UploadedFile, UseGuards, UseInterceptors, Query } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiExcludeEndpoint, ApiParam, ApiTags } from "@nestjs/swagger";
import { RawBody } from "src/decorator/raw-body.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { UsernameDto } from "src/dto/auth.dto";
import { DepositDto } from "src/dto/deposit.dto";
import { ImageDto, OptionalImageDto } from "src/dto/file.dto";
import { PaymentMethodDto } from "src/dto/payment-method.dto";
import { NameDto, UserInterestDto, UserNotificationRequestDto, UserUpdateDto, WalletDto } from "src/dto/user.dto";
import { WithdrawDto } from "src/dto/withdraw.dto";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";
import { FileFilterService } from "src/services/static/file-filter.service";
import { UserService } from "src/services/user.service";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @ApiExcludeEndpoint()
    @Post('webhook')
    createAdmin(@Headers('stripe-signature') signature: string, @RawBody() body: any) {
        return this.userService.webhook(signature, body)
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('image')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/profile')))
    image(@Body() imageDto: OptionalImageDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.image(file?.filename || imageDto.avatar, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('selfie')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/selfie')))
    selfie(@Body() imageDto: ImageDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.selfie(file.filename, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('wallet')
    addWallet(@Body() walletDto: WalletDto, @CurrentUser() user: IUser) {
        return this.userService.addWallet(walletDto, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('withdraw')
    withdraw(@Body() withdrawDto: WithdrawDto, @CurrentUser() user: IUser) {
        return this.userService.withdraw(withdrawDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/profile')))
    updateUser(@Body() userUpdateDto: UserUpdateDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.updateUser(userUpdateDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('payment-method/:id')
    @ApiParam({ name: 'id' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/pm')))
    updatePaymentMethod(@Param('id') id: string, @Body() paymentMethodDto: PaymentMethodDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.updatePaymentMethod(id, paymentMethodDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('payment-method')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/pm')))
    addPaymentMethod(@Body() paymentMethodDto: PaymentMethodDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.addPaymentMethod(paymentMethodDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('deposit')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/transaction')))
    deposit(@Body() depositDto: DepositDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.deposit(depositDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('name')
    name(@Body() nameDto: NameDto, @CurrentUser() user: IUser) {
        return this.userService.name(nameDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('username/check')
    usernameCheck(@Body() usernameDto: UsernameDto, @CurrentUser() user: IUser) {
        return this.userService.usernameCheck(usernameDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('username')
    username(@Body() usernameDto: UsernameDto, @CurrentUser() user: IUser) {
        return this.userService.username(usernameDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('interest')
    interest(@Body() userInterestDto: UserInterestDto, @CurrentUser() user: IUser) {
        return this.userService.interest(userInterestDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('notification/mark-as-read/all')
    markAllAsRead(@CurrentUser() user: IUser) {
        return this.userService.markAllAsRead(user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('notification/mark-as-read/:id')
    @ApiParam({ name: 'id' })
    markAsRead(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.userService.markAsRead(id, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('avatar')
    avatar(@CurrentUser() user: IUser) {
        return this.userService.avatar(user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('payment-method')
    getPaymentMethod(@CurrentUser() user: IUser) {
        return this.userService.getPaymentMethod(user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('payment-method/:id')
    @ApiParam({ name: 'id' })
    getPaymentMethodById(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.userService.getPaymentMethodById(id, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('notification')
    notification(@Query() query: UserNotificationRequestDto, @CurrentUser() user: IUser) {
        return this.userService.notification(query, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('public-key')
    stripePublicKey(@CurrentUser() user: IUser) {
        return this.userService.stripePublicKey();
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({ name: 'id' })
    @Delete('interest/:id')
    deleteInterest(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.userService.deleteInterest(id, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('image')
    deleteImage(@CurrentUser() user: IUser) {
        return this.userService.deleteImage(user);
    }
}