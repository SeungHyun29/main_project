import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class IamportService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  // 인증 토큰 발급 받기
  async getToken() {
    const token = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMP_KEY, // REST API키
        imp_secret: process.env.IMP_SECRET, // REST API Secret
      },
    });

    return token.data.response.access_token;
  }

  async getPaymentData({ access_Token, impUid }) {
    const token = axios({
      url: `https://api.iamport.kr/payments/${impUid}`, // imp_uid 전달
      method: 'get', // GET method
      headers: { Authorization: access_Token }, // 인증 토큰 Authorization header에 추가
    })
      .then((response) => {
        return response;
      })
      .catch((err) => {
        if (err.response.status === 404) {
          throw new UnprocessableEntityException(
            'imp_uid가 유효하지 않습니다.',
          );
        }
        return err;
      });
    return token;
  }

  async cancelPayment({ access_Token, impUid, paymentAmount }) {
    const cancel = await axios({
      url: 'https://api.iamport.kr/payments/cancel',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: access_Token, // 아임포트 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        imp_uid: impUid, // imp_uid를 환불 `unique key`로 입력
        amount: paymentAmount,
      },
    });

    return cancel;
  }
}
