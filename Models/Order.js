import fs from 'fs';
import path from 'path';
import { MongoOrder, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

class OrderModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'orders.json');
    if (!fs.existsSync(this.filePath)) {
      this.write([]);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading orders data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing orders data:', error);
      return false;
    }
  }

  async create(orderData) {
    const newOrder = {
      id: 'ord-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      ...orderData
    };

    if (getMongoConnectionStatus()) {
      try {
        await MongoOrder.create(newOrder);
      } catch (err) {
        console.error('MongoOrder create error, syncing to JSON fallback:', err);
      }
    }

    const orders = this.read();
    orders.push(newOrder);
    this.write(orders);
    return { ...newOrder };
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoOrder.find(query);
        return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoOrder find error, falling back to JSON:', err);
      }
    }
    const orders = this.read();
    return orders.filter(ord => {
      for (const key in query) {
        if (ord[key] !== query[key]) return false;
      }
      return true;
    }).map(o => ({ ...o }));
  }

  async findById(id) {
    if (getMongoConnectionStatus()) {
      try {
        const found = await MongoOrder.findOne({ id });
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoOrder findById error, falling back to JSON:', err);
      }
    }
    const orders = this.read();
    const found = orders.find(o => o.id === id);
    return found ? { ...found } : null;
  }

  async update(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const updated = await MongoOrder.findOneAndUpdate({ id }, updateData, { new: true });
        // Also update local storage fallback
        const orders = this.read();
        const idx = orders.findIndex(o => o.id === id);
        if (idx > -1) {
          orders[idx] = { ...orders[idx], ...updateData };
          this.write(orders);
        }
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoOrder update error, falling back to JSON:', err);
      }
    }

    const orders = this.read();
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return null;
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData
    };
    this.write(orders);
    return { ...orders[orderIndex] };
  }

  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  async delete(id) {
    if (getMongoConnectionStatus()) {
      try {
        await MongoOrder.deleteOne({ id });
      } catch (err) {
        console.error('MongoOrder delete error:', err);
      }
    }
    const orders = this.read();
    const filtered = orders.filter(o => o.id !== id);
    this.write(filtered);
    return true;
  }
}

export default new OrderModel();
