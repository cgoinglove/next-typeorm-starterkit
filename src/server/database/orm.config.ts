import { DataSourceOptions } from 'typeorm';
import { Todo } from '../entities/todo.entity';

console.log(process.env.DB_HOST);

const ORM_CONFIG: DataSourceOptions = {
  type: 'mysql',
  port: Number(process.env.DB_PORT) || 3306,
  host: process.env.DB_HOST || 'localhost',
  entities: [Todo],
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '1234',
  database: process.env.MYSQL_DATABASE || 'cgoing',
  synchronize: false,
  logging: true,
};

export default ORM_CONFIG;
