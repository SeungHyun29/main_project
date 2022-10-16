import { Module } from '@nestjs/common';
import { FileResolcer } from './file.resolver';
import { FileService } from './file.service';

@Module({
  providers: [
    FileResolcer, //
    FileService,
  ],
})
export class FilesModule {}
