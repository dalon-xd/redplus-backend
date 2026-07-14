import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Comunidad = sequelize.define('Comunidad', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true, 
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT
  },
  members: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

export default Comunidad;