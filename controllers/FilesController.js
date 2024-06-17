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
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      if (!name) return res.status(400).json({ error: 'Missing name' });

      const validTypes = ['folder', 'file', 'image'];
      if (!type || !validTypes.includes(type)) return res.status(400).json({ error: 'Missing type' });

      if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
        if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }

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
      console.error('Error in postUpload:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error in getFileById:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page, 10) || 0;

      const query = {
        userId: new ObjectId(userId),
        parentId: parentId === '0' ? 0 : new ObjectId(parentId),
      };

      console.log('Query:', query);

      const files = await dbClient.db.collection('files')
        .find(query)
        .skip(page * 20)
        .limit(20)
        .toArray();

      console.log('Files:', files);

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error in getFiles:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId), userId: new ObjectId(userId) },
        { $set: { isPublic: true } },
      );

      const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error('Error in publishFile:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId), userId: new ObjectId(userId) },
        { $set: { isPublic: false } },
      );

      const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error('Error in unpublishFile:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
