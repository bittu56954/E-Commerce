import fs from 'fs';
import path from 'path';
import { MongoSettings, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const DEFAULT_SETTINGS = {
  storeName: "zomato",
  currencySymbol: "₹",
  gstPercentage: 5,
  storeStatus: "Open",
  heroTitle: "Gourmet Platters, At Your Doorstep.",
  heroSubtitle: "Experience food delivery simplified. Browse gourmet recipes, apply premium discounts, and track cooking preparation streams live!",
  backgrounds: {
    home: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600",
    about: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600",
    contact: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600",
    register: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600",
    login: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1600",
    dashboard: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600",
    admin: "https://images.unsplash.com/photo-1490815685287-c24a72d74021?q=80&w=1600"
  }
};

class SettingsModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'settings.json');
    if (!fs.existsSync(this.filePath)) {
      this.write(DEFAULT_SETTINGS);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading settings data:', error);
      return DEFAULT_SETTINGS;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing settings data:', error);
      return false;
    }
  }

  async get() {
    if (getMongoConnectionStatus()) {
      try {
        const found = await MongoSettings.findOne({});
        if (found) return found.toObject();
        // If not found in DB but connected, seed it!
        const created = await MongoSettings.create(DEFAULT_SETTINGS);
        return created.toObject();
      } catch (err) {
        console.error('MongoSettings get error, falling back to JSON:', err);
      }
    }
    return this.read();
  }

  async update(updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const current = await this.get();
        const mergedBackgrounds = updateData.backgrounds
          ? { ...current.backgrounds, ...updateData.backgrounds }
          : current.backgrounds;

        const updated = await MongoSettings.findOneAndUpdate(
          {},
          { ...updateData, backgrounds: mergedBackgrounds },
          { new: true, upsert: true }
        );
        // Also update local fallback settings
        const currentJson = this.read();
        const updatedJson = {
          ...currentJson,
          ...updateData,
          backgrounds: updateData.backgrounds 
            ? { ...currentJson.backgrounds, ...updateData.backgrounds }
            : currentJson.backgrounds
        };
        this.write(updatedJson);
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoSettings update error, falling back to JSON:', err);
      }
    }

    const current = this.read();
    const updated = {
      ...current,
      ...updateData,
      backgrounds: updateData.backgrounds 
        ? { ...current.backgrounds, ...updateData.backgrounds }
        : current.backgrounds
    };
    this.write(updated);
    return updated;
  }
}

export default new SettingsModel();
