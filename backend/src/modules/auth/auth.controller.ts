import { Controller, Post, Body, Get, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterCustomerDto } from '../customers/dto/register-customer.dto';
import { UpdateCustomerProfileDto } from '../customers/dto/update-customer-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('customer/register')
  @HttpCode(HttpStatus.CREATED)
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  async loginCustomer(@Body() loginDto: LoginDto) {
    return this.authService.loginCustomer(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: { id: string; accountType?: string }) {
    if (user.accountType === 'customer') {
      return this.authService.getCustomerProfile(user.id);
    }
    return this.authService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, CustomerAccountGuard)
  async updateCustomerProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.authService.updateCustomerProfile(user.id, dto);
  }
}
