import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Mongoose schema for AuditLog
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  email: { type: String, required: true },
  ip: { type: String, required: true },
  details: { type: String, required: true }
});

const MongoAuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

class AuditLogModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'audit_logs.json');
    if (!fs.existsSync(this.filePath)) {
      this.write([]);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading audit logs data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing audit logs data:', error);
      return false;
    }
  }

  async log(action, email, ip, details) {
    const newLog = {
      id: 'log-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      action,
      email: email || 'system',
      ip: ip || '127.0.0.1',
      details
    };

    console.log(`[AUDIT LOG] [${newLog.timestamp}] [${action}] User: ${email} | IP: ${ip} | Details: ${details}`);

    if (getMongoConnectionStatus()) {
      try {
        await MongoAuditLog.create(newLog);
      } catch (err) {
        console.error('MongoAuditLog save error, syncing to JSON:', err);
      }
    }

    const logs = this.read();
    logs.push(newLog);
    this.write(logs);
    return newLog;
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoAuditLog.find(query);
        return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoAuditLog find error, falling back to JSON:', err);
      }
    }
    const logs = this.read();
    return logs.filter(log => {
      for (const key in query) {
        if (log[key] !== query[key]) return false;
      }
      return true;
    }).map(l => ({ ...l }));
  }
}

export default new AuditLogModel();
