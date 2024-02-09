import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const datasource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  migrations: ['dist/migrations/*.js'],
});

datasource.initialize();

export default datasource;
