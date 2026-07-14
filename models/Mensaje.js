import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Mensaje = sequelize.define('Mensaje', {
  senderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING
  }
});

export default Mensaje;