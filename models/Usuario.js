import { DataTypes } from 'sequelize';
import sequelize from '../db.js'; 


const Usuario = sequelize.define('Usuario', {
  username: {
    type: DataTypes.STRING,
    allowNull: false, 
    unique: true      
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bio: {
    type: DataTypes.STRING,
    defaultValue: '¡Hola! Soy nuevo en RedPlus.'
  },
  avatar: {
    type: DataTypes.TEXT 
  },
  habilities: {
    type: DataTypes.ARRAY(DataTypes.STRING), 
    defaultValue: []
  },
  recientes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

export default Usuario;