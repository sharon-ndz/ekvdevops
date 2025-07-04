import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import 'reflect-metadata';
import appConfig from '.';
dotenv.config();

const options = appConfig()[process.env.NODE_ENV];
const dataSource = new DataSource(options);
// dataSource.initialize();

export default dataSource;
