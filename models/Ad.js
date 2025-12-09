const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  position: { type: String, default: 'mid-page-banner' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  optimization: { type: Object, default: {} },
  image_path: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Simple static-style wrapper to match controller usage
adSchema.statics.createAd = async function(adData, imagePath) {
  const doc = new this({ ...adData, image_path: imagePath, createdAt: new Date(), updatedAt: new Date() });
  await doc.save();
  return doc.toObject();
};

adSchema.statics.getAll = async function() {
  const docs = await this.find().sort({ createdAt: -1 }).lean();
  return docs;
};

adSchema.statics.getById = async function(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return this.findById(id).lean();
};

adSchema.statics.updateAd = async function(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const updated = await this.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
  return updated;
};

adSchema.statics.deleteAd = async function(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return this.findByIdAndDelete(id);
};

const Ad = mongoose.model('Ad', adSchema);

// Export helper methods expected by controller
module.exports = {
  create: async (adData, imagePath) => await Ad.createAd(adData, imagePath),
  getAll: async () => await Ad.getAll(),
  getById: async (id) => await Ad.getById(id),
  update: async (id, data) => await Ad.updateAd(id, data),
  delete: async (id) => await Ad.deleteAd(id)
};
