import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly datasource: DataSource,
  ) {}

  async create({ impUid, paymentAmount, user: _user }) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();

    // ================================== transaction 시작 ==========================
    await queryRunner.startTransaction('SERIALIZABLE');
    // =============================================================================

    try {
      // 1. payment 테이블에 거래 기록 한 줄 생성
      const payment = this.paymentsRepository.create({
        impUid,
        paymentAmount,
        user: _user,
        status: PAYMENT_STATUS_ENUM.PAYMENT,
      });

      // await this.paymentsRepository.save(payment);
      await queryRunner.manager.save(payment);
      // queryRunner를 통해서 save를 사용해서 디비에 저장을 해 줘야 됨
      // queryRunner랑 관련이 있게 하려면 다 쿼리러너를 통해서 가야 됨

      // 2. 유저의 돈 찾아오기
      // const user = await this.usersRepository.findOne({
      //   where: { id: _user.id },
      // });
      const user = await queryRunner.manager.findOne(User, {
        where: { id: _user.id },
        lock: { mode: 'pessimistic_write' },
      });

      // 3. 유저의 돈 업데이트
      // await this.usersRepository.update(
      //   { id: _user.id },
      //   { point: user.point + paymentAmount },
      // );

      const updatedUser = this.usersRepository.create({
        ...user,
        point: user.point + paymentAmount,
      });
      await queryRunner.manager.save(updatedUser);

      // ================================ commit 성공 확정 ==========================
      await queryRunner.commitTransaction();
      // ==========================================================================

      // 4. 최종 결과 프론트엔드에 돌려주기
      return payment;
    } catch (error) {
      // ================================== rollback 되돌리기 =======================
      await queryRunner.rollbackTransaction();
      // ==========================================================================
    } finally {
      // ================================== 연결 해제 ===============================
      await queryRunner.release();
      // ==========================================================================
    }
  }

  async createCancel({ impUid, paymentAmount, user: _user }) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const payment = this.paymentsRepository.create({
        impUid,
        paymentAmount: -paymentAmount,
        user: _user,
        status: PAYMENT_STATUS_ENUM.CANCEL,
      });

      await queryRunner.manager.save(payment);

      // const user = await this.usersRepository.findOne({
      //   where: { id: _user.id },
      // });
      const user = await queryRunner.manager.findOne(User, {
        where: { id: _user.id },
        lock: { mode: 'pessimistic_write' },
      });

      await this.usersRepository.update(
        { id: _user.id },
        { point: user.point - paymentAmount },
      );

      const updatedUser = this.usersRepository.create({
        ...user,
        point: user.point - paymentAmount,
      });
      await queryRunner.manager.save(updatedUser);

      await queryRunner.commitTransaction();

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findStatus({ impUid }) {
    return await this.paymentsRepository.findOne({
      where: { impUid },
    });
  }
}
