import fs from 'fs';
import path from 'path';
import { MongoPendingUser, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

class PendingUserModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'pending_users.json');
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const allPending = JSON.parse(data);
      
      const now = new Date();
      const validPending = allPending.filter(u => u.otpExpires && new Date(u.otpExpires) > now);
      
      if (validPending.length !== allPending.length) {
        this.write(validPending);
      }
      return validPending;
    } catch (error) {
      console.error('Error reading pending users data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing pending users data:', error);
      return false;
    }
  }

  async findOne(query = {}) {
    const { email } = query;
    if (getMongoConnectionStatus()) {
      try {
        let mongoQuery = {};
        if (email) mongoQuery.email = new RegExp(`^${email}$`, 'i');
        const found = await MongoPendingUser.findOne(mongoQuery);
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoPendingUser findOne error, falling back to JSON:', err);
      }
    }
    const pending = this.read();
    const found = pending.find(u => {
      if (email && u.email.toLowerCase() !== email.toLowerCase()) return false;
      return true;
    });
    return found ? { ...found } : null;
  }

  async create(pendingData) {
    const newPending = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...pendingData
    };

    if (getMongoConnectionStatus()) {
      try {
        // Delete existing pending registration with same email if any
        await MongoPendingUser.deleteOne({ email: new RegExp(`^${pendingData.email}$`, 'i') });
        await MongoPendingUser.create(newPending);
      } catch (err) {
        console.error('MongoPendingUser create error, syncing to JSON fallback:', err);
      }
    }

    const pending = this.read().filter(u => u.email.toLowerCase() !== pendingData.email.toLowerCase());
    pending.push(newPending);
    this.write(pending);
    return { ...newPending };
  }

  async deleteOne(query = {}) {
    const { email } = query;
    let deletedCount = 0;

    if (getMongoConnectionStatus()) {
      try {
        let mongoQuery = {};
        if (email) mongoQuery.email = new RegExp(`^${email}$`, 'i');
        const res = await MongoPendingUser.deleteOne(mongoQuery);
        deletedCount = res.deletedCount;
      } catch (err) {
        console.error('MongoPendingUser deleteOne error, falling back to JSON:', err);
      }
    }

    const pending = this.read();
    const index = pending.findIndex(u => {
      if (email && u.email.toLowerCase() !== email.toLowerCase()) return false;
      return true;
    });

    if (index > -1) {
      pending.splice(index, 1);
      this.write(pending);
      deletedCount = 1;
    }
    return deletedCount > 0;
  }

  async deleteMany(query = {}) {
    const { email } = query;
    if (getMongoConnectionStatus()) {
      try {
        let mongoQuery = {};
        if (email) mongoQuery.email = new RegExp(`^${email}$`, 'i');
        await MongoPendingUser.deleteMany(mongoQuery);
      } catch (err) {
        console.error('MongoPendingUser deleteMany error, falling back to JSON:', err);
      }
    }
    const pending = this.read().filter(u => {
      if (email && u.email.toLowerCase() === email.toLowerCase()) return false;
      return true;
    });
    this.write(pending);
    return true;
  }

  async findByIdAndUpdate(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const updated = await MongoPendingUser.findOneAndUpdate({ id }, updateData, { new: true });
        const pending = this.read();
        const idx = pending.findIndex(u => u.id === id);
        if (idx > -1) {
          pending[idx] = { ...pending[idx], ...updateData };
          this.write(pending);
        }
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoPendingUser findByIdAndUpdate error, falling back to JSON:', err);
      }
    }
    const pending = this.read();
    const index = pending.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    pending[index] = {
      ...pending[index],
      ...updateData
    };
    
    this.write(pending);
    return { ...pending[index] };
  }
}

export default new PendingUserModel();
