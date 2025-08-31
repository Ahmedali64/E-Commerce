import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'OK',
        message: 'Database Connection is working!',
        database: 'Connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'ERROR',
        message: 'Database connection failed',
        database: 'Disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
