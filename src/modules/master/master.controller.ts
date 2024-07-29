import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasAccess } from 'src/decorator/access.decorator';
import { HasRoles } from 'src/decorator/role.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { PaymentMethodDto } from 'src/dto/payment-method.dto';
import { ActiveDto } from 'src/dto/user.dto';
import { AccessEnum } from 'src/enum/access.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IUser } from 'src/interface/user.interface';
import { AccessGuard } from 'src/services/guard/access.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { MasterService } from 'src/services/master.service';
import { FileFilterService } from 'src/services/static/file-filter.service';
@ApiTags('Master')
@Controller('master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('payment-method/:id')
    @ApiParam({ name: 'id' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/pm')))
    updatePaymentMethod(@Param('id') id: string, @Body() paymentMethodDto: PaymentMethodDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.masterService.updatePaymentMethod(id, paymentMethodDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('payment-method')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/pm')))
    createPaymentMethod(@Body() paymentMethodDto: PaymentMethodDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.masterService.createPaymentMethod(paymentMethodDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('payment-method/:id')
    updatePaymentMethodStatus(@Param('id') id: string, @Body() activeDto: ActiveDto, @CurrentUser() user: IUser) {
        return this.masterService.updatePaymentMethodStatus(id, activeDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('user/payment-method')
    getAllUserPaymentMethod(@CurrentUser() user: IUser) {
        return this.masterService.getAllUserPaymentMethod();
    }
    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('user/payment-method/:id')
    @ApiParam({ name: 'id' })
    getUserPaymentMethodById(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.masterService.getUserPaymentMethodById(id);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('payment-method')
    getAllPaymentMethod(@CurrentUser() user: IUser) {
        return this.masterService.getAllPaymentMethod();
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('payment-method/:id')
    @ApiParam({ name: 'id' })
    getPaymentMethodById(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.masterService.getPaymentMethodById(id);
    }
}