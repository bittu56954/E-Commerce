import fs from 'fs';
import path from 'path';
import { MongoUser, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

class UserModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing users data:', error);
      return false;
    }
  }

  async findOne(query = {}) {
    const { email, phone } = query;
    if (getMongoConnectionStatus()) {
      try {
        let mongoQuery = {};
        if (email) mongoQuery.email = new RegExp(`^${email}$`, 'i');
        if (phone) mongoQuery.phone = phone;
        const found = await MongoUser.findOne(mongoQuery);
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoUser findOne error, falling back to JSON:', err);
      }
    }
    const users = this.read();
    const found = users.find(u => {
      if (email && u.email.toLowerCase() !== email.toLowerCase()) return false;
      if (phone && u.phone !== phone) return false;
      return true;
    });
    return found ? { ...found } : null;
  }

  async findById(id) {
    if (getMongoConnectionStatus()) {
      try {
        const found = await MongoUser.findOne({ id });
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoUser findById error, falling back to JSON:', err);
      }
    }
    const users = this.read();
    const found = users.find(u => u.id === id);
    return found ? { ...found } : null;
  }

  async create(userData) {
    const newUser = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isVerified: false,
      otpEmailCode: null,
      otpPhoneCode: null,
      otpExpires: null,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      refreshTokens: [],
      ...userData
    };

    if (getMongoConnectionStatus()) {
      try {
        await MongoUser.create(newUser);
      } catch (err) {
        console.error('MongoUser create error, syncing to JSON fallback:', err);
      }
    }

    const users = this.read();
    users.push(newUser);
    this.write(users);
    return { ...newUser };
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoUser.find(query);
        return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoUser find error, falling back to JSON:', err);
      }
    }
    const users = this.read();
    return users.filter(user => {
      for (const key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    }).map(u => ({ ...u }));
  }

  async findByIdAndUpdate(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const updated = await MongoUser.findOneAndUpdate({ id }, updateData, { new: true });
        // Also update local JSON fallback database
        const users = this.read();
        const idx = users.findIndex(u => u.id === id);
        if (idx > -1) {
          users[idx] = { ...users[idx], ...updateData };
          this.write(users);
        }
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoUser findByIdAndUpdate error, falling back to JSON:', err);
      }
    }
    const users = this.read();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updateData
    };
    
    this.write(users);
    return { ...users[index] };
  }

  async findByIdAndDelete(id) {
    if (getMongoConnectionStatus()) {
      try {
        await MongoUser.deleteOne({ id });
      } catch (err) {
        console.error('MongoUser findByIdAndDelete error, falling back to JSON:', err);
      }
    }
    const users = this.read();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    this.write(users);
    return true;
  }
}

export default new UserModel();
