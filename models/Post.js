import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Post = sequelize.define('Post', {
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  communityId: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT
  },
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [] 
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  usuariosLike: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  comentarios: {
    type: DataTypes.JSON, 
    defaultValue: []
  }
});

export default Post;