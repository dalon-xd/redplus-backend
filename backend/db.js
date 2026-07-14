import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('redplus_db', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,       
  logging: false,   //Para no ver tantos mensajes
});

export default sequelize;
