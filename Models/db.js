import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isMongoConnected = false;

const mongoURI = process.env.MONGODB_URI;

if (mongoURI) {
  console.log(`Connecting to MongoDB at: ${mongoURI}`);
  mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      isMongoConnected = true;
      console.log('====================================================');
      console.log('🔌 DATABASE: Successfully connected to MongoDB! (Active)');
      console.log('====================================================');
      await syncLocalDataToMongo();
    })
    .catch((err) => {
      isMongoConnected = false;
      console.error('====================================================');
      console.error('⚠️ DATABASE CONNECTION ERROR:', err.message);
      console.error('📂 PERSISTENCE FALLBACK: Active local JSON filesystem storage');
      console.error('====================================================');
    });
} else {
  console.log('====================================================');
  console.log('📂 PERSISTENCE: MONGODB_URI not found. Fallback local JSON storage active.');
  console.log('====================================================');
}

// MONGODB SCHEMAS
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  currentLocation: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  
  // Security properties
  isVerified: { type: Boolean, default: false },
  otpEmailCode: { type: String, default: null },
  otpPhoneCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  refreshTokens: [{ type: String }]
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  image: { type: String, required: true }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  couponApplied: { type: String, default: null },
  customerDetails: {
    name: String,
    phone: String,
    address: String,
    notes: String
  },
  status: { type: String, default: 'Pending' },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, default: 'Pending' },
  paymentDetails: {
    transactionId: { type: String, default: null },
    methodType: { type: String, default: null },
    upiId: { type: String, default: null },
    cardLast4: { type: String, default: null }
  },
  cancellationReason: { type: String, default: null },
  refundStatus: { type: String, default: 'None' },
  refundDetails: {
    refundAmount: { type: Number, default: 0 },
    processedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🍽️' }
});

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'zomato' },
  currencySymbol: { type: String, default: '₹' },
  gstPercentage: { type: Number, default: 5 },
  storeStatus: { type: String, default: 'Open' },
  heroTitle: { type: String, default: 'Gourmet Platters, At Your Doorstep.' },
  heroSubtitle: { type: String, default: '' },
  backgrounds: {
    home: String,
    about: String,
    contact: String,
    register: String,
    login: String,
    dashboard: String,
    admin: String
  }
});

const ContactSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// EXPORT MONGOOSE MODELS
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const MongoOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const MongoCategory = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const MongoSettings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
const MongoContact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export const getMongoConnectionStatus = () => {
  return mongoose.connection.readyState === 1; // 1 means connected
};

async function syncLocalDataToMongo() {
  try {
    const DATA_DIR = path.resolve('data');
    if (!fs.existsSync(DATA_DIR)) return;

    const syncCollection = async (model, filename, modelName) => {
      const filePath = path.join(DATA_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          const count = await model.countDocuments({});
          if (count === 0) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const items = JSON.parse(fileData);
            if (Array.isArray(items) && items.length > 0) {
              console.log(`🔌 DB SYNC: Seeding ${items.length} records into MongoDB collection for ${modelName}...`);
              await model.insertMany(items);
            } else if (items && typeof items === 'object' && !Array.isArray(items)) {
              console.log(`🔌 DB SYNC: Seeding configuration settings into MongoDB...`);
              await model.create(items);
            }
          }
        } catch (err) {
          console.error(`❌ DB SYNC ERROR for ${modelName}:`, err.message);
        }
      }
    };

    await syncCollection(MongoUser, 'users.json', 'User');
    await syncCollection(MongoProduct, 'products.json', 'Product');
    await syncCollection(MongoCategory, 'categories.json', 'Category');
    await syncCollection(MongoSettings, 'settings.json', 'Settings');
    await syncCollection(MongoOrder, 'orders.json', 'Order');
    await syncCollection(MongoContact, 'contacts.json', 'Contact');

    // Dynamically check if AuditLog model is registered
    const MongoAuditLog = mongoose.models.AuditLog;
    if (MongoAuditLog) {
      await syncCollection(MongoAuditLog, 'audit_logs.json', 'AuditLog');
    }
  } catch (err) {
    console.error('❌ DB SYNC ERROR: General sync error:', err.message);
  }
}

export {
  MongoUser,
  MongoProduct,
  MongoOrder,
  MongoCategory,
  MongoSettings,
  MongoContact
};
