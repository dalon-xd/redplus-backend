import express from 'express';
import cors from 'cors';
import sequelize from './db.js';
import Usuario from './models/Usuario.js';
import Comunidad from './models/Comunidad.js';
import Post from './models/Post.js';
import { Op } from 'sequelize';
import Mensaje from './models/Mensaje.js';
import MensajeGrupo from './models/MensajeGrupo.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- USUARIOS ---
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await Usuario.findOne({
      where: { 
        username: username.trim(),
        password: password 
      }
    });

    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userExists = await Usuario.findOne({ 
      where: { username: username.trim() } 
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
    }

    const newUser = await Usuario.create({
      username: username.trim(),
      password: password
    });

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const publicUsers = await Usuario.findAll({
      attributes: ['username', 'bio', 'avatar', 'habilities'] 
    });
    
    res.json(publicUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener usuarios.' });
  }
});

app.put('/api/users/profile', async (req, res) => {
  const { username, bio, avatar, habilities } = req.body;
  
  try {
    const user = await Usuario.findOne({ where: { username: username } });

    if (user) {
      user.bio = bio;
      user.avatar = avatar;
      user.habilities = habilities;
      
      await user.save();
      
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// --- COMUNIDADES ---

app.get('/api/communities', async (req, res) => {
  try {
    const comunidades = await Comunidad.findAll();
    res.json(comunidades);
  } catch (error) {
    console.error('Error al obtener comunidades:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/communities', async (req, res) => {
  const { id, name, desc } = req.body;
  
  try {
    const exists = await Comunidad.findOne({ 
      where: { id: id } 
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'El ID de la comunidad ya existe.' });
    }

    const newComm = await Comunidad.create({
      id,
      name,
      desc
    });

    res.json({ success: true, community: newComm });
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});


app.post('/api/communities/:id/join', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  
  try {
    const comm = await Comunidad.findOne({ where: { id } });

    if (!comm) return res.status(404).json({ message: 'Comunidad no encontrada.' });

    let membersList = [...comm.members]; 
    const memberIndex = membersList.indexOf(username);
    
    if (memberIndex === -1) {
      membersList.push(username); 
    } else {
      membersList.splice(memberIndex, 1); 
    }

    comm.members = membersList;
    comm.changed('members', true); 
    await comm.save();

    res.json({ success: true, community: comm });
  } catch (error) {
    console.error('Error al modificar miembros:', error);
    res.status(500).json({ message: 'Error interno.' });
  }
});

// --- PUBLICACIONES ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    res.json(posts);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ message: 'Error interno.' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { author, title, body: content, communityId, youtubeUrl, tags } = req.body;

  try {
    const newPost = await Post.create({
      author,
      communityId: communityId || 'general',
      title,
      body: content,
      youtubeUrl: youtubeUrl || null,
      tags: tags || []
    });
    res.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// --- DIRECTOS (STREAMS) ---
app.get('/api/streams', async (req, res) => {
  try {
    const streams = await Post.findAll({
      where: {
        youtubeUrl: {
          [Op.not]: null 
        }
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(streams);
  } catch (error) {
    console.error('Error al obtener streams:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, body: content } = req.body;
  
  try {
    const post = await Post.findByPk(id); 
    if (post) {
      post.title = title;
      post.body = content;
      await post.save();
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id);
    if (post) {
      await post.destroy(); 
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  
  try {
    const post = await Post.findByPk(id);
    if (post) {
      let likesList = [...post.usuariosLike];
      const index = likesList.indexOf(username);
      
      if (index === -1) {
        likesList.push(username);
        post.likes += 1;
      } else {
        likesList.splice(index, 1);
        post.likes -= 1;
      }
      
      post.usuariosLike = likesList;
      post.changed('usuariosLike', true);
      await post.save();
      
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});


// --- BUSCADOR ---
app.get('/api/search', async (req, res) => {
  const { q } = req.query; 
  
  if (!q) return res.json([]); 

  try {
    const resultados = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { body: { [Op.iLike]: `%${q}%` } }
        ]
      },
      order: [['createdAt', 'DESC']] 
    });

    res.json(resultados);
  } catch (error) {
    console.error('Error en el buscador:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// --- TENDENCIAS (TRENDS) ---
app.get('/api/trends', async (req, res) => {
  try {
    const posts = await Post.findAll();
    const conteoTags = {};

    posts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          const tagLimpio = tag.trim().toLowerCase();
          conteoTags[tagLimpio] = (conteoTags[tagLimpio] || 0) + 1;
        });
      }
    });

    const topTendencias = Object.keys(conteoTags)
      .map(tag => ({ tag: tag, posts: conteoTags[tag] }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);

    res.json(topTendencias);
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// --- COMENTARIOS ---
app.post('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { autor, texto } = req.body;
  
  try {
    const post = await Post.findByPk(id);
    if (post) {
      const newComment = {
        id: Date.now(),
        autor,
        texto
      };
      
      
      let comments = [...post.comentarios];
      comments.push(newComment);
      
      post.comentarios = comments;
      post.changed('comentarios', true); 
      await post.save();
      
      res.json({ success: true, comment: newComment, post });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar comentario.' });
  }
});

app.put('/api/posts/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;
  const { texto } = req.body;
  
  try {
    const post = await Post.findByPk(postId);
    if (post) {
      let comments = [...post.comentarios];
      const commentIndex = comments.findIndex(c => c.id === parseInt(commentId));
      
      if (commentIndex !== -1) {
        comments[commentIndex].texto = texto;
        post.comentarios = comments;
        post.changed('comentarios', true);
        await post.save();
        res.json({ success: true, comment: comments[commentIndex], post });
      } else {
        res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al editar comentario.' });
  }
});

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;
  
  try {
    const post = await Post.findByPk(postId);
    if (post) {
      post.comentarios = post.comentarios.filter(c => c.id !== parseInt(commentId));
      post.changed('comentarios', true);
      await post.save();
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar comentario.' });
  }
});

// --- MENSAJES PRIVADOS ---
app.get('/api/messages', async (req, res) => {
  const { user } = req.query;
  
  try {
    if (user) {
      const filtered = await Mensaje.findAll({
        where: {
          [Op.or]: [
            { senderId: user },
            { receiverId: user }
          ]
        },
        order: [['createdAt', 'ASC']] 
      });
      res.json(filtered);
    } else {
      const messages = await Mensaje.findAll();
      res.json(messages);
    }
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    const newMsg = await Mensaje.create({
      senderId,
      receiverId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    res.json({ success: true, message: newMsg });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  
  try {
    const msg = await Mensaje.findByPk(id);
    if (msg) {
      msg.text = text;
      await msg.save();
      res.json({ success: true, message: msg });
    } else {
      res.status(404).json({ success: false, message: 'Mensaje no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const msg = await Mensaje.findByPk(id);
    if (msg) {
      await msg.destroy();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Mensaje no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// --- CHATS DE GRUPO ---
app.get('/api/groups/:groupId/chats', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const chats = await MensajeGrupo.findAll({
      where: { groupId: groupId },
      order: [['createdAt', 'ASC']] 
    });

    if (chats.length === 0) {
      res.json([
        { id: 1, emisor: 'System', texto: `¡Bienvenidos al canal de ${groupId}! Reglas: Respeto y compartir código.` }
      ]);
    } else {
      res.json(chats);
    }
  } catch (error) {
    console.error('Error al obtener chat de grupo:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/groups/:groupId/chats', async (req, res) => {
  const { groupId } = req.params;
  const { emisor, texto } = req.body;
  
  try {
    const newChatMsg = await MensajeGrupo.create({
      groupId,
      emisor,
      texto,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    res.json({ success: true, message: newChatMsg });
  } catch (error) {
    console.error('Error al enviar mensaje de grupo:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// --- RECIENTES ---
app.get('/api/recientes/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const user = await Usuario.findOne({ where: { username } });
    res.json(user ? user.recientes : []);
  } catch (error) {
    console.error('Error al obtener recientes:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

app.post('/api/recientes/:username', async (req, res) => {
  const { username } = req.params;
  const { communityId } = req.body;
  
  try {
    const user = await Usuario.findOne({ where: { username } });
    
    if (user) {
      let list = user.recientes.filter(id => id !== communityId);
      list.unshift(communityId);
      user.recientes = list.slice(0, 5);
      
      user.changed('recientes', true);
      await user.save();
      
      res.json({ success: true, recientes: user.recientes });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error('Error al guardar reciente:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

const probarConexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('¡Conexión a PostgreSQL correcta!');
    await sequelize.sync({ alter: true });
    console.log('¡Tablas sincronizadas!');
  } catch (error) {
    console.error('Error al conectar a la BD:', error);
  }
};

probarConexion();

app.listen(PORT, () => {
  console.log(`Backend de RedPlus corriendo en http://localhost:${PORT}`);
});

// Ver grabación del 26 de junio 00:17:00 vinculación postgresql