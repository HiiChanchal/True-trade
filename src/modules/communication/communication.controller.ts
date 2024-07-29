import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import { HasAccess } from "src/decorator/access.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { SearchCommunicationDto, SendEmailDto, SendNotificationDto } from "src/dto/communication.dto";
import { AccessEnum } from "src/enum/access.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { CommunicationService } from "src/services/communication.service";
import { AccessGuard } from "src/services/guard/access.guard";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";


@ApiTags('Communication')
@Controller('communication')
export class CommunicationController {
    constructor(private communicationService: CommunicationService) { }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.EMAIL)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('email')
    email(@Body() emailDto: SendEmailDto, @CurrentUser() user: IUser) {
        return this.communicationService.sendEmail(emailDto, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.NOTIFICATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('notification')
    notification(@Body() notificationDto: SendNotificationDto, @CurrentUser() user: IUser) {
        return this.communicationService.sendNotification(notificationDto, user);
    }

    @HasRoles(RoleEnum.TRADER, RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({ name: 'id' })
    @Put('notification/:id')
    notificationClick(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.communicationService.notificationClick(id, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.NOTIFICATION, AccessEnum.EMAIL)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download')
    downloadCommunication(@Query() query: SearchCommunicationDto, @CurrentUser() user: IUser) {
        return this.communicationService.downloadCommunication(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.NOTIFICATION, AccessEnum.EMAIL)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('')
    getCommunication(@Query() query: SearchCommunicationDto, @CurrentUser() user: IUser) {
        return this.communicationService.getCommunication(query, user);
    }
}