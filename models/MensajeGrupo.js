import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const MensajeGrupo = sequelize.define('MensajeGrupo', {
  groupId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emisor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING
  }
});

export default MensajeGrupo;