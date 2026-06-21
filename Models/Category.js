import fs from 'fs';
import path from 'path';
import { MongoCategory, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Pizza', icon: '🍕' },
  { id: 'cat-2', name: 'Burger', icon: '🍔' },
  { id: 'cat-3', name: 'Food', icon: '🍛' },
  { id: 'cat-4', name: 'Drinks', icon: '🥤' },
  { id: 'cat-5', name: 'Desserts', icon: '🍰' }
];

class CategoryModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'categories.json');
    if (!fs.existsSync(this.filePath)) {
      this.write(DEFAULT_CATEGORIES);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading categories data:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing categories data:', error);
      return false;
    }
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoCategory.find(query);
        if (results.length > 0) return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoCategory find error, falling back to JSON:', err);
      }
    }
    const categories = this.read();
    return categories.filter(cat => {
      for (const key in query) {
        if (cat[key] !== query[key]) return false;
      }
      return true;
    }).map(c => ({ ...c }));
  }

  async findById(id) {
    if (getMongoConnectionStatus()) {
      try {
        const found = await MongoCategory.findOne({ id });
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoCategory findById error, falling back to JSON:', err);
      }
    }
    const categories = this.read();
    const found = categories.find(c => c.id === id);
    return found ? { ...found } : null;
  }

  async create(catData) {
    const newCategory = {
      id: 'cat-' + Date.now().toString(),
      icon: catData.icon || '🍽️',
      ...catData
    };

    if (getMongoConnectionStatus()) {
      try {
        await MongoCategory.create(newCategory);
      } catch (err) {
        console.error('MongoCategory create error:', err);
      }
    }

    const categories = this.read();
    categories.push(newCategory);
    this.write(categories);
    return { ...newCategory };
  }

  async findByIdAndUpdate(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const updated = await MongoCategory.findOneAndUpdate({ id }, updateData, { new: true });
        // update local
        const categories = this.read();
        const idx = categories.findIndex(c => c.id === id);
        if (idx > -1) {
          categories[idx] = { ...categories[idx], ...updateData };
          this.write(categories);
        }
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoCategory findByIdAndUpdate error, falling back to JSON:', err);
      }
    }

    const categories = this.read();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    categories[index] = {
      ...categories[index],
      ...updateData
    };
    
    this.write(categories);
    return { ...categories[index] };
  }

  async findByIdAndDelete(id) {
    if (getMongoConnectionStatus()) {
      try {
        await MongoCategory.deleteOne({ id });
      } catch (err) {
        console.error('MongoCategory delete error:', err);
      }
    }
    const categories = this.read();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    categories.splice(index, 1);
    this.write(categories);
    return true;
  }
}

export default new CategoryModel();
