import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, IsNull } from 'typeorm';
import { File } from './file.entity';
import * as util from 'util';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async saveFile(
    file: Express.Multer.File,
    lng: number,
    lat: number,
  ): Promise<File> {
    const newFile = new File();
    newFile.name = file.originalname;
    newFile.size = file.size;
    newFile.uploadTime = new Date();
    newFile.path = file.path;
    newFile.lng = lng;
    newFile.lat = lat;
    return await this.fileRepository.save(newFile);
  }

  async getFile(id: any): Promise<File> {
    return await this.fileRepository.findOne({
      where: {
        id: Not(IsNull()),
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async getFileContent(id: any): Promise<any> {
    const file = await this.fileRepository.findOneById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const readFile = util.promisify(fs.readFile);
    const content = await readFile(file.path);

    const workbook = XLSX.read(content, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const result = jsonData.map((item) => ({
      lng: item['经度'],
      lat: item['纬度'],
      chlorophyll: item['浓度'],
      name: `叶绿素: ${item['浓度']}<br/>经度：${item['经度']}<br/>纬度：${item['纬度']}`,
    }));

    return {
      lng: file.lng,
      lat: file.lat,
      data: result,
    };
  }

  async getAllFile(): Promise<File> {
    const data: any = await this.fileRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return data;
  }
}
