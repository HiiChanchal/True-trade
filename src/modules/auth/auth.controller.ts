import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { AdminDto } from 'src/dto/admin.dto';
import { UsernameDto, AuthDto, AuthEmailDto, SocialAuthDto } from 'src/dto/auth.dto';
import { DeviceDto } from 'src/dto/device.dto';
import { EmailDto } from 'src/dto/email.dto';
import { TermsDto } from 'src/dto/user.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IUser } from 'src/interface/user.interface';
import { AuthService } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { LocalAuthGuard } from 'src/services/guard/local-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiExcludeEndpoint()
    @Post('admin')
    createAdmin(@Body() adminDto: AdminDto) {
        return this.authService.registerAdmin(adminDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('admin/signin')
    adminSignin(@Body() authDto: AuthDto, @CurrentUser() user: IUser) {
        return this.authService.adminSignin(user);
    }

    @Post('check')
    check(@Body() emailDto: EmailDto) {
        return this.authService.authCheck(emailDto);
    }

    @Post('signin')
    signin(@Body() authEmailDto: AuthEmailDto, @CurrentUser() user: IUser) {
        if (authEmailDto.isNew)
            return this.authService.newLogin(authEmailDto)
        else
            return this.authService.login(authEmailDto);
    }

    @Post('google')
    googleLogin(@Body() socialAuthDto: SocialAuthDto) {
        return this.authService.googleLogin(socialAuthDto);
    }
    @Post('apple')
    appleLogin(@Body() socialAuthDto: SocialAuthDto) {
        return this.authService.appleLogin(socialAuthDto);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('device')
    async device(@Body() deviceDto: DeviceDto, @CurrentUser() user: IUser) {
        return this.authService.device(deviceDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('switch')
    async switch(@CurrentUser() user: IUser) {
        return this.authService.switch(user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('be-a-provider')
    beAProvider(@Body() termsDto: TermsDto, @CurrentUser() user: IUser) {
        return this.authService.beAProvider(termsDto, user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    myInfo(@CurrentUser() user: IUser) {
        return this.authService.myInfo(user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('signout')
    logout(@CurrentUser() user: IUser) {
        return this.authService.logout(user);
    }
}