import { IStrategyOptions, Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import validate = WebAssembly.validate;
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { User } from '@libs/db/models/user.model';
import { BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcryptjs';

export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectModel(User) private userModel: ReturnModelType<typeof User>,
  ) {
    super({
      // 表示从客户端请求体传过来的字段的用户名密码字段
      usernameField: 'username',
      passwordField: 'password',
    } as IStrategyOptions);
  }

  // 验证逻辑
  async validate(username: string, password: string) {
    const user = await this.userModel
      .findOne({ username: username })
      .select('+password');
    if (!user) {
      throw new BadRequestException('用户名不正确');
    }
    if (!compareSync(password, user.password)) {
      throw new BadRequestException('密码不正确');
    }
    return user;
  }
}
