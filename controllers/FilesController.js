const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

class FilesController {
  static async postUpload(req, res) {
    try {
      // Retrieve the user based on the token
      const token = req.headers['x-token'];
      console.log('Received token:', token);

      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      console.log('Retrieved userId from Redis:', userId);

      if (!userId) {
        console.log('User not found in Redis for token:', token);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      const validTypes = ['folder', 'file', 'image'];
      if (!type || !validTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Prepare the file document
      const fileDoc = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : new ObjectId(parentId),
      };

      if (type === 'folder') {
        await dbClient.db.collection('files').insertOne(fileDoc);
        return res.status(201).json(fileDoc);
      }
      const filePath = path.join(folderPath, uuidv4());
      const fileData = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileData);
      fileDoc.localPath = filePath;

      await dbClient.db.collection('files').insertOne(fileDoc);
      return res.status(201).json(fileDoc);
    } catch (error) {
      console.error('Error in postFile:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
