import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true,
    },
    referrerName: {
      type: String,
      trim: true,
      default: null,
    },
    isNewVisitor: {
      type: Boolean,
      default: true,
    },
    pagePath: {
      type: String,
      default: '/',
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['Mobile', 'Tablet', 'Desktop', 'Unknown'],
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    os: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    ipHash: {
      type: String,
      default: null,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const Visit = mongoose.models.Visit || mongoose.model('Visit', visitSchema);
