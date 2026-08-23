const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TSnKuVgteVheGX';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'ON7wJdzn7mp1CDUEjF5jtbej';

  return new Razorpay({
    key_id,
    key_secret,
  });
};

class PaymentController {
  // Create Razorpay Order
  async createOrder(req, res) {
    try {
      const { amount, currency = 'INR', receipt, notes } = req.body;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid order amount is required.',
        });
      }

      const instance = getRazorpayInstance();
      const amountInPaise = Math.round(Number(amount) * 100);

      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      };

      const razorpayOrder = await instance.orders.create(options);

      return res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TSnKuVgteVheGX',
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          status: razorpayOrder.status,
        },
      });
    } catch (error) {
      console.error('Razorpay Create Order Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize Razorpay payment order.',
      });
    }
  }

  // Verify Razorpay Payment Signature
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required Razorpay payment verification parameters.',
        });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET || 'ON7wJdzn7mp1CDUEjF5jtbej';
      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (isSignatureValid) {
        return res.status(200).json({
          success: true,
          message: 'Payment signature verified successfully! 💳',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid Razorpay payment signature! Security check failed.',
        });
      }
    } catch (error) {
      console.error('Razorpay Verify Payment Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Payment signature verification failed.',
      });
    }
  }
}

module.exports = new PaymentController();
