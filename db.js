import { Sequelize } from 'sequelize';


const sequelize = new Sequelize('postgres', 'admin_redplus', 'aJa3%1K^$3%P0&04', {
  
  host: 'redplus-db-grupo-6.postgres.database.azure.com', 
  
  dialect: 'postgres',
  port: 5432,       
  logging: false,
  
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;