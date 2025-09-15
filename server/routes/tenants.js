const express = require('express');
const Tenant = require('../models/Tenant');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/:slug/upgrade', authenticate, isAdmin, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant._id.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to upgrade this tenant' });
    }

    tenant.subscription = 'pro';
    await tenant.save();

    res.json({
      message: 'Subscription upgraded to Pro successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
