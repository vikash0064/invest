import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  symbol: { type: String, required: true },
  date: { type: Date, default: Date.now },
  recommendation: { type: String, required: true, enum: ['INVEST', 'PASS'] },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  summary: { type: String, required: true },
  fullData: { type: mongoose.Schema.Types.Mixed, required: true },
  userEmail: { type: String, default: 'guest@alphainvest.ai', index: true }
}, { timestamps: true });

// Create indexes for faster queries
researchSchema.index({ symbol: 1 });
researchSchema.index({ date: -1 });

export default mongoose.model('Research', researchSchema);
