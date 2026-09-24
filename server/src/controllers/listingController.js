import Joi from 'joi';
import { Listing } from '../models/Listing.js';

// Enums specified in README section 1
const categories = ['textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const statuses = ['active', 'sold', 'removed'];

// Section 2: Joi validation schemas
const createSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid(...categories).default('other'),
  condition: Joi.string().valid(...conditions).default('used'),
  seller: Joi.string().hex().length(24).optional().allow(null)
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1),
  description: Joi.string().allow(''),
  price: Joi.number().min(0),
  category: Joi.string().valid(...categories),
  condition: Joi.string().valid(...conditions),
  status: Joi.string().valid(...statuses),
  seller: Joi.string().hex().length(24).allow(null)
});

// GET /api/listings (Section 3 & Stretch Goal 6: populate)
// Excludes removed listings by default unless ?includeRemoved=true is passed
export async function getAllListings(req, res, next) {
  try {
    const filter = {};
    if (req.query.includeRemoved !== 'true') {
      filter.status = { $ne: 'removed' };
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id (Section 3 & Stretch Goal 6: populate)
export async function getListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email');

    if (!listing || (listing.status === 'removed' && req.query.includeRemoved !== 'true')) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// POST /api/listings (Section 3)
export async function createListing(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const listing = await Listing.create(value);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/listings/:id (Section 3)
export async function updateListing(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/listings/:id (Section 4: Soft delete)
// Sets status to 'removed' instead of deleting from MongoDB
export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'removed' } },
      { new: true }
    );

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    res.json({ message: 'Listing marked as removed', listing });
  } catch (err) {
    next(err);
  }
}