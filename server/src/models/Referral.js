import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    creatorVisitorId: {
      type: String,
      required: true,
      index: true,
    },
    referrerName: {
      type: String,
      required: true,
      trim: true,
      default: 'Deepak Prajapati',
      maxlength: 60,
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
    qualifiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referredVisitors: [
      {
        visitorId: { type: String, required: true },
        hasCompletedAdventure: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      }
    ],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

export const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
