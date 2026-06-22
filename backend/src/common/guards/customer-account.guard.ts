import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CustomerAccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (user?.accountType !== 'customer') {
      throw new ForbiddenException('Chỉ khách hàng mới được thực hiện thao tác này');
    }

    return true;
  }
}
