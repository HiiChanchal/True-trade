import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { HasAccess } from "src/decorator/access.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { SearchProviderDto } from "src/dto/admin.dto";
import { CommentDto, SearchSignalDto, SignalDto, SignalStatusDto } from "src/dto/signal.dto";
import { ProviderPlanDto, SearchProviderSubscriberDto } from "src/dto/subscription-plan.dto";
import { ActiveDto, ProfileStatusDto } from "src/dto/user.dto";
import { AccessEnum } from "src/enum/access.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { AccessGuard } from "src/services/guard/access.guard";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";
import { ProviderService } from "src/services/provider.service";

@ApiTags('Provider')
@Controller('provider')
export class ProviderController {
    constructor(private providerService: ProviderService) { }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('plans')
    plans(@Body() providerPlanDto: ProviderPlanDto, @CurrentUser() user: IUser) {
        return this.providerService.plans(providerPlanDto, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('signal')
    signal(@Body() signalDto: SignalDto, @CurrentUser() user: IUser) {
        return this.providerService.signal(signalDto, user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HasRoles(RoleEnum.PROVIDER)
    @ApiParam({ name: 'id' })
    @Put('plans/:id/status')
    plansStatus(@Param('id') id: string, @Body() activeDto: ActiveDto, @CurrentUser() user: IUser) {
        return this.providerService.plansStatus(id, activeDto, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRADES)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('signal/:id/status')
    status(@Param('id') id: string, @Query() signalStatusDto: SignalStatusDto) {
        return this.providerService.signalStatus(id, signalStatusDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HasRoles(RoleEnum.PROVIDER)
    @ApiParam({ name: 'id' })
    @Put('signal/:id/comment')
    signalCommnet(@Param('id') id: string, @Body() message: CommentDto, @CurrentUser() user: IUser) {
        return this.providerService.signalCommnet(id, message, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRADES)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('signal/:id/target-hit')
    signalTargetHit(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.signalTargetHit(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRADES)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('signal/:id/stoploss-hit')
    signalStoplossHit(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.signalStoplossHit(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRADES)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('signal/:id/not-active')
    signalNotActive(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.signalNotActive(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Put(':id/status')
    @ApiParam({ name: 'id' })
    profileStatus(@Param('id') id: string, @Body() profileStatusDto: ProfileStatusDto, @CurrentUser() user: IUser) {
        return this.providerService.profileStatus(id, profileStatusDto, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('plans')
    getPlans(@CurrentUser() user: IUser) {
        return this.providerService.getPlans(user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({ name: 'id' })
    @Get('signal/:id/comment')
    getSignalCommnet(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.getSignalCommnet(id, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('signal')
    getSignals(@Query() query: SearchSignalDto, @CurrentUser() user: IUser) {
        return this.providerService.getSignals(query, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('subscriber')
    getSubscriber(@Query() query: SearchProviderSubscriberDto, @CurrentUser() user: IUser) {
        return this.providerService.getSubscriber(query, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('earning')
    getEarning(@CurrentUser() user: IUser) {
        return this.providerService.getEarning(user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.VERIFICATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('verification')
    getAllProviderForVerification(@Query() query: SearchProviderDto, @CurrentUser() user: IUser) {
        return this.providerService.getAllProviderForVerification(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download')
    downloadAllProvider(@Query() query: SearchProviderDto, @CurrentUser() user: IUser) {
        return this.providerService.downloadAllProvider(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download/verification')
    downloadAllProviderForVerification(@Query() query: SearchProviderDto, @CurrentUser() user: IUser) {
        return this.providerService.downloadAllProviderForVerification(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getProviderDetail(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.getProviderDetail(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('')
    getAllProvider(@Query() query: SearchProviderDto, @CurrentUser() user: IUser) {
        return this.providerService.getAllProvider(query, user);
    }

    @HasRoles(RoleEnum.PROVIDER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('plans/:id')
    @ApiParam({ name: 'id' })
    delete(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.providerService.deletePlan(id, user);
    }
}