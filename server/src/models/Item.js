const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['found', 'lost'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    images: [{ type: String }],
    urgent: { type: Boolean, default: false },
    contactPreference: { type: String, enum: ['both', 'email', 'phone'], default: 'both' },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String },
    college: { type: String, required: true },
    campus: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
