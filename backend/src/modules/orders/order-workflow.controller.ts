import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrderWorkflowService } from './order-workflow.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AssignOrderDto,
  CancelOrderDto,
  CnReceiveDto,
  DeliverOrderDto,
  DepartOrderDto,
  PurchaseOrderDto,
  QuoteOrderDto,
  SettleOrderDto,
  UpdateOrderItemsDto,
  VnReceiveDto,
} from './dto/order-actions.dto';

type Req = { user: { id: string } };

/**
 * One endpoint per step of the job, instead of a general-purpose status field.
 * Each step decides the resulting status itself, so a client cannot put an
 * order into a state the flow does not allow.
 */
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderWorkflowController {
  constructor(private readonly workflow: OrderWorkflowService) {}

  /** Số tiền đã thu, còn phải thu và các bước hợp lệ kế tiếp. */
  @Get(':id/summary')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  summary(@Param('id') id: string) {
    return this.workflow.getSummary(id);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN, Role.SALES)
  assign(@Param('id') id: string, @Body() dto: AssignOrderDto) {
    return this.workflow.assign(id, dto);
  }

  @Post(':id/quote')
  @Roles(Role.ADMIN, Role.SALES)
  quote(
    @Param('id') id: string,
    @Body() dto: QuoteOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.quote(id, dto, req.user.id);
  }

  @Post(':id/purchase')
  @Roles(Role.ADMIN, Role.SALES)
  purchase(
    @Param('id') id: string,
    @Body() dto: PurchaseOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.purchase(id, dto, req.user.id);
  }

  @Post(':id/cn-receive')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  cnReceive(
    @Param('id') id: string,
    @Body() dto: CnReceiveDto,
    @Request() req: Req,
  ) {
    return this.workflow.cnReceive(id, dto, req.user.id);
  }

  @Post(':id/depart')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  depart(
    @Param('id') id: string,
    @Body() dto: DepartOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.depart(id, dto, req.user.id);
  }

  @Post(':id/vn-receive')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  vnReceive(
    @Param('id') id: string,
    @Body() dto: VnReceiveDto,
    @Request() req: Req,
  ) {
    return this.workflow.vnReceive(id, dto, req.user.id);
  }

  @Post(':id/settle')
  @Roles(Role.ADMIN, Role.SALES)
  settle(
    @Param('id') id: string,
    @Body() dto: SettleOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.settle(id, dto, req.user.id);
  }

  @Post(':id/request-delivery')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  requestDelivery(@Param('id') id: string, @Body() dto: { note?: string }) {
    return this.workflow.requestDelivery(id, dto?.note);
  }

  @Post(':id/deliver')
  @Roles(Role.ADMIN, Role.SALES, Role.DRIVER)
  deliver(
    @Param('id') id: string,
    @Body() dto: DeliverOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.deliver(id, dto, req.user.id);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.SALES)
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @Request() req: Req,
  ) {
    return this.workflow.cancel(id, dto, req.user.id);
  }

  @Patch(':id/items')
  @Roles(Role.ADMIN, Role.SALES)
  updateItems(@Param('id') id: string, @Body() dto: UpdateOrderItemsDto) {
    return this.workflow.updateItems(id, dto);
  }
}
