import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.usersRepository.find({});
  }

  async findOne({ userId }) {
    return await this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  async findOneUser({ email }) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async WithDelete() {
    return await this.usersRepository.find({
      withDeleted: true,
    });
  }

  async create({ email, hashedPassword: password, name, phonenumber }) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

    return await this.usersRepository.save({
      email,
      password,
      name,
      phonenumber,
    });
  }

  async update({ userId, updateUserInput, loginhass }) {
    // 수정 후 결과값까지 받을 때 사용
    const userList = await this.usersRepository.findOne({
      where: { id: userId },
    });

    const result = this.usersRepository.save({
      ...userList,
      id: userId,
      ...updateUserInput,
      password: loginhass,
    });
    return result;
  }

  async delete({ userId }) {
    const deleteresult = await this.usersRepository.softDelete({ id: userId });
    return deleteresult.affected ? true : false;
  }

  async restore({ userId }) {
    const result = await this.usersRepository.restore({ id: userId });
    return result.affected ? true : false;
  }
}
