import fs from 'fs';
import path from 'path';
import { getMongoConnectionStatus } from './db.js';
import mongoose from 'mongoose';

// Dynamic Import of MongoSpot to prevent circular dependencies in db.js
const getMongoSpotModel = () => mongoose.models.Spot;

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const generateDefaultSpots = () => {
  const list = [];
  
  // 1. DINING OUT SPOTS
  const diningCuisines = ["North Indian", "South Indian", "Chinese", "Continental", "Mughlai", "Desserts", "Italian", "Fast Food", "Seafood", "Street Food"];
  const diningLocations = ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout", "MG Road", "Malleshwaram", "Sadashivnagar", "BTM Layout", "Marathahalli"];
  const diningImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600",
    "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600"
  ];
  const diningPrefix = ["The Great", "Royal", "Gourmet", "Spice", "Golden", "Urban", "Vintage", "Capital", "Signature", "Heritage"];
  const diningSuffix = ["Kitchen", "Bistro", "Dhaba", "Restaurant", "Tavern", "Palace", "Plaza", "Grill", "House", "Diner"];
  
  const originalDining = [
    { name: "The Bier Library", cuisine: "Continental, Finger Food, Brewery", location: "Koramangala, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600", price: "₹1,500 for two" },
    { name: "Toit", cuisine: "Italian, Pizza, Craft Beer", location: "Indiranagar, Bengaluru", rating: "4.8", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600", price: "₹2,000 for two" },
    { name: "Punjab Grill", cuisine: "North Indian, Mughlai", location: "Whitefield, Bengaluru", rating: "4.5", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600", price: "₹1,800 for two" },
    { name: "Windmills Craftworks", cuisine: "American, North Indian, Salad", location: "Whitefield, Bengaluru", rating: "4.7", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600", price: "₹2,500 for two" },
    { name: "Fenny's Lounge & Kitchen", cuisine: "Mediterranean, Seafood, Goan", location: "Koramangala, Bengaluru", rating: "4.4", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600", price: "₹1,600 for two" },
    { name: "Corner House Ice Cream", cuisine: "Desserts, Ice Cream", location: "Bhilai, Chhattisgarh, Kurud Road, 490001", rating: "4.9", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600", price: "₹400 for two" }
  ];
  
  originalDining.forEach((d, idx) => {
    list.push({ id: `dining-${idx + 1}`, type: 'dining', ...d });
  });

  for (let i = 1; i <= 194; i++) {
    const p = diningPrefix[(i * 7) % diningPrefix.length];
    const s = diningSuffix[(i * 13) % diningSuffix.length];
    const name = `${p} ${s} #${i}`;
    const cuisine = diningCuisines[(i * 3) % diningCuisines.length] + ", " + diningCuisines[(i * 9) % diningCuisines.length];
    const location = diningLocations[(i * 11) % diningLocations.length] + ", Bengaluru";
    const rating = (3.8 + ((i * 17) % 13) / 10).toFixed(1);
    const image = diningImages[(i * 23) % diningImages.length];
    const price = `₹${Math.floor(400 + ((i * 31) % 40) * 50)} for two`;
    list.push({ id: `dining-gen-${i}`, type: 'dining', name, cuisine, location, rating, image, price });
  }

  // 2. NIGHTLIFE SPOTS
  const nightlifeCuisines = ["Finger Food, Craft Beer", "American, Burgers, Cocktails", "Modern Indian, Craft Beer", "Continental, Finger Food, Brewery", "Mediterranean, Seafood, Goan"];
  const nightlifeLocations = ["Hennur", "Church Street", "Koramangala", "St. Marks Road", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout", "MG Road", "BTM Layout"];
  const nightlifeImages = [
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=600",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=600",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600",
    "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=600"
  ];
  const nightlifePrefix = ["Byg Brewski", "Social", "Club", "Brew", "High", "The Lounge", "Pulse", "Vibe", "Elevate", "Neon"];
  const nightlifeSuffix = ["Brewery", "Club", "Lounge", "Social", "Hub", "Arena", "Pub", "Room", "Bar", "Deck"];

  const originalNightlife = [
    { name: "Byg Brewski Brewing Company", cuisine: "Finger Food, Craft Beer", location: "Hennur, Bengaluru", rating: "4.7", image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=600", price: "₹2,200 for two" },
    { name: "Social", cuisine: "American, North Indian, Cocktails", location: "Church Street, Bengaluru", rating: "4.5", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=600", price: "₹1,400 for two" },
    { name: "XOOX Brewmill", cuisine: "Modern Indian, Craft Beer", location: "Koramangala, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600", price: "₹1,800 for two" },
    { name: "Hard Rock Cafe", cuisine: "American, Burgers, Cocktails", location: "St. Marks Road, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600", price: "₹2,000 for two" }
  ];

  originalNightlife.forEach((n, idx) => {
    list.push({ id: `nightlife-${idx + 1}`, type: 'nightlife', ...n });
  });

  for (let i = 1; i <= 196; i++) {
    const p = nightlifePrefix[(i * 11) % nightlifePrefix.length];
    const s = nightlifeSuffix[(i * 17) % nightlifeSuffix.length];
    const name = `${p} ${s} #${i}`;
    const cuisine = nightlifeCuisines[(i * 7) % nightlifeCuisines.length];
    const location = nightlifeLocations[(i * 13) % nightlifeLocations.length] + ", Bengaluru";
    const rating = (3.8 + ((i * 19) % 13) / 10).toFixed(1);
    const image = nightlifeImages[(i * 29) % nightlifeImages.length];
    const price = `₹${Math.floor(800 + ((i * 23) % 30) * 100)} for two`;
    list.push({ id: `nightlife-gen-${i}`, type: 'nightlife', name, cuisine, location, rating, image, price });
  }

  return list;
};

class SpotModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'spots.json');
    if (!fs.existsSync(this.filePath)) {
      this.write(generateDefaultSpots());
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading spots data:', error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing spots data:', error);
      return false;
    }
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const MongoSpotModel = getMongoSpotModel();
        if (MongoSpotModel) {
          const results = await MongoSpotModel.find(query);
          if (results.length > 0) return results.map(r => r.toObject());
        }
      } catch (err) {
        console.error('MongoSpot find error, falling back to JSON:', err);
      }
    }
    const spots = this.read();
    return spots.filter(spot => {
      for (const key in query) {
        if (spot[key] !== query[key]) return false;
      }
      return true;
    }).map(s => ({ ...s }));
  }

  async findById(id) {
    if (getMongoConnectionStatus()) {
      try {
        const MongoSpotModel = getMongoSpotModel();
        if (MongoSpotModel) {
          const found = await MongoSpotModel.findOne({ id });
          if (found) return found.toObject();
        }
      } catch (err) {
        console.error('MongoSpot findById error, falling back to JSON:', err);
      }
    }
    const spots = this.read();
    const found = spots.find(s => s.id === id);
    return found ? { ...found } : null;
  }

  async create(spotData) {
    const newSpot = {
      id: spotData.type + '-' + Date.now().toString(),
      rating: spotData.rating || '4.0',
      ...spotData
    };

    if (getMongoConnectionStatus()) {
      try {
        const MongoSpotModel = getMongoSpotModel();
        if (MongoSpotModel) {
          await MongoSpotModel.create(newSpot);
        }
      } catch (err) {
        console.error('MongoSpot create error:', err);
      }
    }

    const spots = this.read();
    spots.push(newSpot);
    this.write(spots);
    return { ...newSpot };
  }

  async findByIdAndUpdate(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const MongoSpotModel = getMongoSpotModel();
        if (MongoSpotModel) {
          const updated = await MongoSpotModel.findOneAndUpdate({ id }, updateData, { new: true });
          
          // update local
          const spots = this.read();
          const idx = spots.findIndex(s => s.id === id);
          if (idx > -1) {
            spots[idx] = { ...spots[idx], ...updateData };
            this.write(spots);
          }
          if (updated) return updated.toObject();
        }
      } catch (err) {
        console.error('MongoSpot findByIdAndUpdate error, falling back to JSON:', err);
      }
    }

    const spots = this.read();
    const index = spots.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    spots[index] = {
      ...spots[index],
      ...updateData
    };
    
    this.write(spots);
    return { ...spots[index] };
  }

  async findByIdAndDelete(id) {
    if (getMongoConnectionStatus()) {
      try {
        const MongoSpotModel = getMongoSpotModel();
        if (MongoSpotModel) {
          await MongoSpotModel.deleteOne({ id });
        }
      } catch (err) {
        console.error('MongoSpot delete error:', err);
      }
    }
    const spots = this.read();
    const index = spots.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    spots.splice(index, 1);
    this.write(spots);
    return true;
  }
}

export default new SpotModel();
