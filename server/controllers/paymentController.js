const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Payment = require('../models/Payment');
const HireRequest = require('../models/HireRequest');

// @desc  Create Stripe checkout session
// @route POST /api/v1/payment/checkout
const createCheckout = async (req, res) => {
  try {
    const { hireRequestId } = req.body;

    const hireRequest = await HireRequest.findById(hireRequestId).populate('helperId', 'name');
    if (!hireRequest) return res.status(404).json({ success: false, message: 'Hire request not found' });
    if (hireRequest.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (hireRequest.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Helper must accept request before payment' });
    }

    const amount = hireRequest.agreedAmount || 0;

    // If Stripe not configured, simulate payment (demo mode)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      let payment = await Payment.findOne({ hireRequestId });
      if (!payment) {
        payment = await Payment.create({
          hireRequestId,
          recruiterId: req.user.id,
          helperId: hireRequest.helperId._id,
          amount,
          status: 'held',
        });
      } else {
        payment.status = 'held';
        await payment.save();
      }
      await HireRequest.findByIdAndUpdate(hireRequestId, { status: 'paid' });
      return res.json({ success: true, demo: true, payment, message: 'Demo payment simulated successfully' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `HelperHub: ${hireRequest.jobTitle || 'Service Booking'}`,
            description: `Payment to ${hireRequest.helperId.name}`,
          },
          unit_amount: amount * 100, // paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/job/${hireRequestId}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/job/${hireRequestId}?payment=cancelled`,
    });

    const payment = await Payment.create({
      hireRequestId,
      recruiterId: req.user.id,
      helperId: hireRequest.helperId._id,
      amount,
      stripeSessionId: session.id,
      status: 'pending',
    });

    res.json({ success: true, checkoutUrl: session.url, payment });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment error' });
  }
};

// @desc  Confirm payment (called after Stripe redirect or webhook)
// @route PATCH /api/v1/payment/:hireRequestId/confirm
const confirmPayment = async (req, res) => {
  try {
    const { hireRequestId } = req.params;
    const payment = await Payment.findOne({ hireRequestId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    if (payment.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm payment for this booking' });
    }

    payment.status = 'held';
    await payment.save();

    await HireRequest.findByIdAndUpdate(hireRequestId, { status: 'paid' });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Release payment (after job completion)
// @route PATCH /api/v1/payment/:hireRequestId/release
const releasePayment = async (req, res) => {
  try {
    const { hireRequestId } = req.params;
    const payment = await Payment.findOne({ hireRequestId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    if (payment.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the recruiter or admin can release escrow payment' });
    }

    const hireRequest = await HireRequest.findById(hireRequestId);
    if (!hireRequest) return res.status(404).json({ success: false, message: 'Hire request not found' });

    if (hireRequest.status !== 'completed' && hireRequest.status !== 'rated') {
      return res.status(400).json({ success: false, message: 'Job must be marked as completed before payment release' });
    }

    payment.status = 'released';
    await payment.save();
    res.json({ success: true, payment, message: 'Payment released to helper' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get payment info
// @route GET /api/v1/payment/:hireRequestId
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ hireRequestId: req.params.hireRequestId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    if (payment.recruiterId.toString() !== req.user.id && payment.helperId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createCheckout, confirmPayment, releasePayment, getPayment };
