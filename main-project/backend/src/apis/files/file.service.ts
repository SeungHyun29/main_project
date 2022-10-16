import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class FileService {
  async upload({ files }) {
    // 파일을 클라우드 스토리지에 저장하는 로직

    const waitedFiles = await Promise.all(files);
    console.log(waitedFiles); // [file,file]

    const bucket = 'hamzzi-storage';
    const storage = new Storage({
      projectId: process.env.PROJECT_ID,
      keyFilename: 'reliable-aloe-358105-3a9820e41e50.json',
    }).bucket(bucket);

    const results = await Promise.all(
      waitedFiles.map(
        (el) =>
          new Promise((resolve, reject) => {
            el.createReadStream()
              .pipe(storage.file(el.filename).createWriteStream())
              .on('finish', () => resolve(`${bucket}/${el.filename}`))
              .on('error', () => reject('실패'));
          }),
      ),
    );

    return results;
  }
}
