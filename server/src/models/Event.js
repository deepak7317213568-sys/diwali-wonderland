import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        'website_visit',
        'gift_opened',
        'game_started',
        'game_completed',
        'task_completed',
        'invitation_shared',
      ],
      index: true,
    },
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
    stageId: {
      type: Number,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
