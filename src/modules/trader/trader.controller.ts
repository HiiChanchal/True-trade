import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { HasAccess } from "src/decorator/access.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { SearchTraderDto } from "src/dto/admin.dto";
import { SearchDto } from "src/dto/search.dto";
import { SearchProviderForTraderDto, SearchTraderSignalDto, SearchTraderSubscriptionDto, TraderSubscriptionDto, UnsubscribeDto } from "src/dto/trader.dto";
import { AccessEnum } from "src/enum/access.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { AccessGuard } from "src/services/guard/access.guard";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";
import { TraderService } from "src/services/trader.service";

@ApiTags('Trader')
@Controller('trader')
export class TraderController {
    constructor(private traderService: TraderService) { }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('subscription')
    subscription(@Body() traderSubscriptionDto: TraderSubscriptionDto, @CurrentUser() user: IUser) {
        return this.traderService.subscription(traderSubscriptionDto, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('un-subscription')
    Umsubscription(@Body() unsubscribeDto: UnsubscribeDto, @CurrentUser() user: IUser) {
        return this.traderService.Umsubscription(unsubscribeDto, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('mark-as-trade/:id')
    @ApiParam({ name: 'id' })
    markAsTrade(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.markAsTrade(id, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('provider/all')
    getProviderForCategory(@Query() query: SearchDto, @CurrentUser() user: IUser) {
        return this.traderService.getProviderForCategory(query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('provider/search')
    getSearchProvider(@Query() query: SearchProviderForTraderDto, @CurrentUser() user: IUser) {
        return this.traderService.getSearchProvider(query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('provider/:id/plans')
    @ApiParam({ name: 'id' })
    getProviderPlans(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.getProviderPlans(id, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('provider/:id/signals')
    @ApiParam({ name: 'id' })
    getProviderSignals(@Param('id') id: string, @Query() query: SearchTraderSignalDto, @CurrentUser() user: IUser) {
        return this.traderService.getProviderSignals(id, query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('provider/:id')
    @ApiParam({ name: 'id' })
    getProviderDetails(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.getProviderDetails(id, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('signal/search')
    getSearchSignals(@Query() query: SearchTraderSignalDto, @CurrentUser() user: IUser) {
        return this.traderService.getSearchSignals(query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiParam({ name: 'id' })
    @Get('signal/:id/comment')
    getSignalCommnet(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.getSignalCommnet(id, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('subscription')
    getSubscription(@Query() query: SearchTraderSubscriptionDto, @CurrentUser() user: IUser) {
        return this.traderService.getSubscription(query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('my-trade')
    getMyTradeSignal(@Query() query: SearchTraderSignalDto, @CurrentUser() user: IUser) {
        return this.traderService.getMyTradeSignal(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download')
    downloadAllTrader(@Query() query: SearchTraderDto, @CurrentUser() user: IUser) {
        return this.traderService.downloadAllTrader(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getTraderDetail(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.getTraderDetail(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.USERS)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('')
    getAllTrader(@Query() query: SearchTraderDto, @CurrentUser() user: IUser) {
        return this.traderService.getAllTrader(query, user);
    }

    @HasRoles(RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('subscription/:id')
    @ApiParam({ name: 'id' })
    deleteSubscription(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.traderService.deleteSubscription(id, user);
    }

}