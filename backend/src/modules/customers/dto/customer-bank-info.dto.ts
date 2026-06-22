import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerBankInfoDto {
  @IsString({ message: 'Tên ngân hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên ngân hàng không được để trống' })
  bankName: string;

  @IsString({ message: 'Số tài khoản phải là chuỗi' })
  @IsNotEmpty({ message: 'Số tài khoản không được để trống' })
  accountNumber: string;

  @IsString({ message: 'Chủ tài khoản phải là chuỗi' })
  @IsNotEmpty({ message: 'Chủ tài khoản không được để trống' })
  accountHolder: string;
}

export type CustomerBankInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};
