// file.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileService } from './file.service';
import { Response } from 'express';
import { File } from './file.entity';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file,
    @Body('lng') lng: number,
    @Body('lat') lat: number,
  ): Promise<File> {
    return await this.fileService.saveFile(file, lng, lat);
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: any, @Res() res: Response) {
    const file = await this.fileService.getFile(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    res.download(file.path, file.name);
  }

  @Get('getData')
  async getDataFile() {
    return await this.fileService.getAllFile();
  }

  @Get('content/:id')
  async getFileContent(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<void> {
    const content = await this.fileService.getFileContent(id);
    res.json(content);
  }
}
