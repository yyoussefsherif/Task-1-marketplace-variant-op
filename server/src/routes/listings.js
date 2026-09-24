import { Router } from 'express';
import {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
} from '../controllers/listingController.js';

const router = Router();

// GET /api/listings - list all active listings
router.get('/', getAllListings);

// GET /api/listings/:id - get single listing
router.get('/:id', getListing);

// POST /api/listings - create a new listing
router.post('/', createListing);

// PATCH /api/listings/:id - update a listing
router.patch('/:id', updateListing);

// DELETE /api/listings/:id - soft delete a listing (sets status to 'removed')
router.delete('/:id', deleteListing);

export default router;