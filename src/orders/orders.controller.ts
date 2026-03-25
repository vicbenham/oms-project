import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @ApiBearerAuth('JWT') indique à Swagger que ces routes nécessitent un token
@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard) // toutes les routes de ce controller sont protégées
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une commande' })
  @ApiResponse({ status: 201, description: 'Commande créée' })
  create(@Request() req, @Body() dto: CreateOrderDto) {
    // req.user est injecté par JwtAuthGuard via la JwtStrategy
    return this.ordersService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister mes commandes' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, req.user.id, dto);
  }
}