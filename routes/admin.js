const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalDonors,
      availableDonors,
      pendingRequests,
      fulfilledRequests,
      criticalRequests,
      stock,
      donorsByBloodGroup,
      recentDonors,
      recentRequests
    ] = await Promise.all([
      Donor.countDocuments(),
      Donor.countDocuments({ isAvailable: true }),
      BloodRequest.countDocuments({ status: 'Pending' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      BloodRequest.countDocuments({ status: 'Pending', urgency: 'Critical' }),
      BloodStock.find().sort({ bloodGroup: 1 }),
      Donor.aggregate([
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Donor.find().sort({ createdAt: -1 }).limit(5),
      BloodRequest.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          availableDonors,
          pendingRequests,
          fulfilledRequests,
          criticalRequests
        },
        stock,
        donorsByBloodGroup,
        recentDonors,
        recentRequests
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
