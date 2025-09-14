const express = require('express');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to check subscription limits
const checkSubscriptionLimits = async (req, res, next) => {
  try {
    // Get tenant info
    const tenant = await Tenant.findById(req.user.tenantId);
    
    // If tenant is on pro plan, no limits
    if (tenant.subscription === 'pro') {
      return next();
    }
    
    // For free plan, check note count
    const noteCount = await Note.countDocuments({ tenantId: req.user.tenantId });
    
    // Free plan limit is 3 notes
    if (noteCount >= 3) {
      return res.status(403).json({ 
        message: 'Free plan limit reached. Please upgrade to Pro for unlimited notes.',
        limitReached: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', authenticate, checkSubscriptionLimits, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const note = new Note({
      title,
      content,
      tenantId: req.user.tenantId,
      createdBy: req.user._id
    });
    
    await note.save();
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes
// @desc    Get all notes for current tenant
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 });
    
    // Get tenant info for subscription status
    const tenant = await Tenant.findById(req.user.tenantId);
    
    res.json({
      notes,
      subscription: tenant.subscription,
      isProPlan: tenant.subscription === 'pro',
      noteCount: notes.length
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a specific note
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if note belongs to user's tenant
    if (note.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this note' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Find note and check ownership
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if note belongs to user's tenant
    if (note.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }
    
    // Update note
    note.title = title || note.title;
    note.content = content || note.content;
    note.updatedAt = Date.now();
    
    await note.save();
    
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Find note and check ownership
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if note belongs to user's tenant
    if (note.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }
    
    await note.deleteOne();
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;