import fs from 'fs';
import path from 'path';
import { MongoContact, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

class ContactModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'contacts.json');
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading contacts data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing contacts data:', error);
      return false;
    }
  }

  async create(contactData) {
    const newContact = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...contactData
    };

    if (getMongoConnectionStatus()) {
      try {
        await MongoContact.create(newContact);
      } catch (err) {
        console.error('MongoContact create error:', err);
      }
    }

    const contacts = this.read();
    contacts.push(newContact);
    this.write(contacts);
    return { ...newContact };
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoContact.find(query);
        return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoContact find error, falling back to JSON:', err);
      }
    }
    const contacts = this.read();
    return contacts.filter(contact => {
      for (const key in query) {
        if (contact[key] !== query[key]) return false;
      }
      return true;
    }).map(c => ({ ...c }));
  }

  async findByIdAndDelete(id) {
    if (getMongoConnectionStatus()) {
      try {
        await MongoContact.deleteOne({ id });
      } catch (err) {
        console.error('MongoContact findByIdAndDelete error, falling back to JSON:', err);
      }
    }
    const contacts = this.read();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    contacts.splice(index, 1);
    this.write(contacts);
    return true;
  }
}

export default new ContactModel();
