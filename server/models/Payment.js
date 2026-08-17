const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    hireRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'HireRequest', required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    status: { type: String, enum: ['pending', 'held', 'released', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

paymentSchema.index({ hireRequestId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
