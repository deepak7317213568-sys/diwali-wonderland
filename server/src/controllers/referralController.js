import crypto from 'crypto';
import mongoose from 'mongoose';
import { Referral } from '../models/Referral.js';

// In-memory store fallback when MongoDB is not connected
const inMemoryStore = new Map();

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Generate a random unique code with a sanitized name prefix
const generateUniqueCode = (name = 'DEEPAK') => {
  const firstWord = (name || '').trim().split(/\s+/)[0] || 'DIWALI';
  const cleanPrefix = firstWord
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'DIWALI';

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    rand += chars[randomBytes[i] % chars.length];
  }
  return `${cleanPrefix}-${rand}`;
};

/**
 * Create or retrieve referral record for a visitor with dynamic referrer name
 */
export const createOrGetReferral = async (req, res) => {
  try {
    const { visitorId, preferredCode, referrerName } = req.body;

    if (!visitorId || typeof visitorId !== 'string' || visitorId.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A valid visitor identifier is required.',
      });
    }

    const cleanVisitorId = visitorId.trim();
    const cleanName = (referrerName && typeof referrerName === 'string' && referrerName.trim()) 
      ? referrerName.trim().slice(0, 60)
      : 'Deepak Prajapati';

    // MongoDB Atlas
    if (isMongoConnected()) {
      let existing = await Referral.findOne({ creatorVisitorId: cleanVisitorId });
      if (existing) {
        // If a new name is provided, update existing
        if (referrerName && cleanName !== existing.referrerName) {
          existing.referrerName = cleanName;
          await existing.save();
        }

        return res.status(200).json({
          success: true,
          referralCode: existing.referralCode,
          referrerName: existing.referrerName,
          totalVisits: existing.totalVisits,
          qualifiedCount: existing.qualifiedCount,
          isDbConnected: true,
          message: 'Existing referral record retrieved.',
        });
      }

      // Generate new unique code based on referrerName
      let uniqueCode = preferredCode 
        ? preferredCode.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 14) 
        : generateUniqueCode(cleanName);
      
      let codeCollision = await Referral.findOne({ referralCode: uniqueCode });
      while (codeCollision) {
        uniqueCode = generateUniqueCode(cleanName);
        codeCollision = await Referral.findOne({ referralCode: uniqueCode });
      }

      const newRecord = await Referral.create({
        referralCode: uniqueCode,
        creatorVisitorId: cleanVisitorId,
        referrerName: cleanName,
        totalVisits: 0,
        qualifiedCount: 0,
        referredVisitors: [],
      });

      return res.status(201).json({
        success: true,
        referralCode: newRecord.referralCode,
        referrerName: newRecord.referrerName,
        totalVisits: 0,
        qualifiedCount: 0,
        isDbConnected: true,
        message: 'New referral record created successfully.',
      });
    }

    // In-memory fallback
    for (const [code, record] of inMemoryStore.entries()) {
      if (record.creatorVisitorId === cleanVisitorId) {
        if (referrerName && cleanName !== record.referrerName) {
          record.referrerName = cleanName;
        }

        return res.status(200).json({
          success: true,
          referralCode: code,
          referrerName: record.referrerName,
          totalVisits: record.totalVisits,
          qualifiedCount: record.qualifiedCount,
          isDbConnected: false,
          isDemoMode: true,
          message: 'Retrieved from temporary in-memory store (MongoDB Atlas not configured).',
        });
      }
    }

    let code = generateUniqueCode(cleanName);
    while (inMemoryStore.has(code)) {
      code = generateUniqueCode(cleanName);
    }

    const newMemRecord = {
      referralCode: code,
      creatorVisitorId: cleanVisitorId,
      referrerName: cleanName,
      totalVisits: 0,
      qualifiedCount: 0,
      referredVisitors: new Map(),
      createdAt: new Date(),
    };

    inMemoryStore.set(code, newMemRecord);

    return res.status(201).json({
      success: true,
      referralCode: code,
      referrerName: cleanName,
      totalVisits: 0,
      qualifiedCount: 0,
      isDbConnected: false,
      isDemoMode: true,
      message: 'Created in temporary memory (MongoDB Atlas not configured).',
    });
  } catch (error) {
    console.error('Error in createOrGetReferral:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing referral creation.',
    });
  }
};

/**
 * Lookup referral details by referralCode (validates code and returns inviter's actual name)
 */
export const lookupReferral = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'A referral code is required.',
      });
    }

    const cleanCode = code.trim().toUpperCase();

    if (isMongoConnected()) {
      const record = await Referral.findOne({ referralCode: cleanCode });
      if (!record) {
        return res.status(404).json({
          success: false,
          isValid: false,
          message: 'Referral code not found.',
        });
      }

      return res.status(200).json({
        success: true,
        isValid: true,
        referralCode: record.referralCode,
        referrerName: record.referrerName,
        creatorVisitorId: record.creatorVisitorId,
        totalVisits: record.totalVisits,
        qualifiedCount: record.qualifiedCount,
      });
    }

    // In-memory fallback
    const memRecord = inMemoryStore.get(cleanCode);
    if (!memRecord) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'Referral code not found.',
      });
    }

    return res.status(200).json({
      success: true,
      isValid: true,
      referralCode: memRecord.referralCode,
      referrerName: memRecord.referrerName,
      creatorVisitorId: memRecord.creatorVisitorId,
      totalVisits: memRecord.totalVisits,
      qualifiedCount: memRecord.qualifiedCount,
      isDemoMode: true,
    });
  } catch (error) {
    console.error('Error in lookupReferral:', error);
    return res.status(500).json({
      success: false,
      isValid: false,
      message: 'Internal server error looking up referral code.',
    });
  }
};

/**
 * Update the inviter's name for their referral code
 */
export const updateReferrerName = async (req, res) => {
  try {
    const { visitorId, referrerName } = req.body;
    if (!visitorId || !referrerName || typeof referrerName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Visitor ID and a valid referrer name are required.',
      });
    }

    const cleanVisitorId = visitorId.trim();
    const cleanName = referrerName.trim().slice(0, 60);

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.',
      });
    }

    if (isMongoConnected()) {
      const record = await Referral.findOne({ creatorVisitorId: cleanVisitorId });
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Referral record not found for this visitor.',
        });
      }

      record.referrerName = cleanName;
      await record.save();

      return res.status(200).json({
        success: true,
        referralCode: record.referralCode,
        referrerName: record.referrerName,
        message: 'Referrer name updated successfully.',
      });
    }

    // In-memory fallback
    for (const [code, record] of inMemoryStore.entries()) {
      if (record.creatorVisitorId === cleanVisitorId) {
        record.referrerName = cleanName;
        return res.status(200).json({
          success: true,
          referralCode: code,
          referrerName: cleanName,
          message: 'Referrer name updated in session store.',
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Referral record not found in session memory.',
    });
  } catch (error) {
    console.error('Error in updateReferrerName:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating referrer name.',
    });
  }
};

/**
 * Record a unique visit via referral code
 */
export const recordReferralVisit = async (req, res) => {
  try {
    const { referralCode, visitorId } = req.body;

    if (!referralCode || !visitorId) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and visitor ID are required.',
      });
    }

    const cleanCode = referralCode.trim().toUpperCase();
    const cleanVisitorId = visitorId.trim();

    if (isMongoConnected()) {
      const record = await Referral.findOne({ referralCode: cleanCode });
      if (!record) {
        return res.status(404).json({
          success: false,
          isValid: false,
          message: 'Referral code not found.',
        });
      }

      // Self-referral check: do not count self-visits
      if (record.creatorVisitorId === cleanVisitorId) {
        return res.status(200).json({
          success: true,
          isValid: true,
          isSelfReferral: true,
          referrerName: record.referrerName,
          message: 'Self-referral ignored. Visits to your own link are not counted.',
          totalVisits: record.totalVisits,
          qualifiedCount: record.qualifiedCount,
        });
      }

      // Check if visitor has already visited
      const alreadyReferred = record.referredVisitors.some((v) => v.visitorId === cleanVisitorId);
      if (!alreadyReferred) {
        record.totalVisits += 1;
        record.referredVisitors.push({
          visitorId: cleanVisitorId,
          hasCompletedAdventure: false,
          joinedAt: new Date(),
        });
        record.lastActiveAt = new Date();
        await record.save();
      }

      return res.status(200).json({
        success: true,
        isValid: true,
        isSelfReferral: false,
        isNewVisit: !alreadyReferred,
        referrerName: record.referrerName,
        totalVisits: record.totalVisits,
        qualifiedCount: record.qualifiedCount,
      });
    }

    // In-memory fallback
    const memRecord = inMemoryStore.get(cleanCode);
    if (!memRecord) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'Referral code not found.',
      });
    }

    if (memRecord.creatorVisitorId === cleanVisitorId) {
      return res.status(200).json({
        success: true,
        isValid: true,
        isSelfReferral: true,
        referrerName: memRecord.referrerName,
        message: 'Self-referral ignored.',
        totalVisits: memRecord.totalVisits,
        qualifiedCount: memRecord.qualifiedCount,
      });
    }

    const alreadyReferred = memRecord.referredVisitors.has(cleanVisitorId);
    if (!alreadyReferred) {
      memRecord.totalVisits += 1;
      memRecord.referredVisitors.set(cleanVisitorId, {
        hasCompletedAdventure: false,
        joinedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      isValid: true,
      isSelfReferral: false,
      isNewVisit: !alreadyReferred,
      referrerName: memRecord.referrerName,
      totalVisits: memRecord.totalVisits,
      qualifiedCount: memRecord.qualifiedCount,
      isDemoMode: true,
    });
  } catch (error) {
    console.error('Error in recordReferralVisit:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error recording referral visit.',
    });
  }
};

/**
 * Record that a referred visitor has qualified (completed the adventure)
 */
export const qualifyReferral = async (req, res) => {
  try {
    const { referralCode, visitorId } = req.body;

    if (!referralCode || !visitorId) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and visitor ID are required.',
      });
    }

    const cleanCode = referralCode.trim().toUpperCase();
    const cleanVisitorId = visitorId.trim();

    if (isMongoConnected()) {
      const record = await Referral.findOne({ referralCode: cleanCode });
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Referral code not found.',
        });
      }

      // Self-referral check
      if (record.creatorVisitorId === cleanVisitorId) {
        return res.status(200).json({
          success: true,
          isSelfReferral: true,
          referrerName: record.referrerName,
          message: 'Self-referral qualification ignored.',
          totalVisits: record.totalVisits,
          qualifiedCount: record.qualifiedCount,
        });
      }

      let visitor = record.referredVisitors.find((v) => v.visitorId === cleanVisitorId);
      let newlyQualified = false;

      if (!visitor) {
        record.totalVisits += 1;
        record.qualifiedCount += 1;
        record.referredVisitors.push({
          visitorId: cleanVisitorId,
          hasCompletedAdventure: true,
          joinedAt: new Date(),
        });
        newlyQualified = true;
      } else if (!visitor.hasCompletedAdventure) {
        visitor.hasCompletedAdventure = true;
        record.qualifiedCount += 1;
        newlyQualified = true;
      }

      if (newlyQualified) {
        record.lastActiveAt = new Date();
        await record.save();
      }

      return res.status(200).json({
        success: true,
        newlyQualified,
        referrerName: record.referrerName,
        totalVisits: record.totalVisits,
        qualifiedCount: record.qualifiedCount,
      });
    }

    // In-memory fallback
    const memRecord = inMemoryStore.get(cleanCode);
    if (!memRecord) {
      return res.status(404).json({
        success: false,
        message: 'Referral code not found.',
      });
    }

    if (memRecord.creatorVisitorId === cleanVisitorId) {
      return res.status(200).json({
        success: true,
        isSelfReferral: true,
        referrerName: memRecord.referrerName,
        message: 'Self-referral qualification ignored.',
        totalVisits: memRecord.totalVisits,
        qualifiedCount: memRecord.qualifiedCount,
      });
    }

    let visitor = memRecord.referredVisitors.get(cleanVisitorId);
    let newlyQualified = false;

    if (!visitor) {
      memRecord.totalVisits += 1;
      memRecord.qualifiedCount += 1;
      memRecord.referredVisitors.set(cleanVisitorId, {
        hasCompletedAdventure: true,
        joinedAt: new Date(),
      });
      newlyQualified = true;
    } else if (!visitor.hasCompletedAdventure) {
      visitor.hasCompletedAdventure = true;
      memRecord.qualifiedCount += 1;
      newlyQualified = true;
    }

    return res.status(200).json({
      success: true,
      newlyQualified,
      referrerName: memRecord.referrerName,
      totalVisits: memRecord.totalVisits,
      qualifiedCount: memRecord.qualifiedCount,
      isDemoMode: true,
    });
  } catch (error) {
    console.error('Error in qualifyReferral:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error qualifying referral.',
    });
  }
};

/**
 * Retrieve referral statistics
 */
export const getReferralStats = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();

    if (isMongoConnected()) {
      const record = await Referral.findOne({ referralCode: cleanCode });
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Referral code does not exist.',
        });
      }

      return res.status(200).json({
        success: true,
        referralCode: record.referralCode,
        referrerName: record.referrerName,
        totalVisits: record.totalVisits,
        qualifiedCount: record.qualifiedCount,
        isDbConnected: true,
      });
    }

    const memRecord = inMemoryStore.get(cleanCode);
    if (!memRecord) {
      return res.status(404).json({
        success: false,
        message: 'Referral code not found in session memory.',
      });
    }

    return res.status(200).json({
      success: true,
      referralCode: memRecord.referralCode,
      referrerName: memRecord.referrerName,
      totalVisits: memRecord.totalVisits,
      qualifiedCount: memRecord.qualifiedCount,
      isDbConnected: false,
      isDemoMode: true,
    });
  } catch (error) {
    console.error('Error in getReferralStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching referral stats.',
    });
  }
};
