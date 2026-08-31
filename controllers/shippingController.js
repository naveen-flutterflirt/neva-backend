const { calculateShippingRate } = require('../utils/shiprocket');

class ShippingController {
  /**
   * GET /api/shipping/calculate-rate
   * Query params: pincode, cod, subtotal, weight
   */
  async calculateRate(req, res) {
    try {
      const { pincode, cod, subtotal, weight } = req.query;

      if (!pincode || String(pincode).trim().length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'A valid 6-digit destination pincode is required.',
        });
      }

      const isCod = cod === 'true';
      const parsedSubtotal = parseFloat(subtotal || '0');
      const parsedWeight = parseFloat(weight || '0.5');

      // Check if subtotal is eligible for free shipping (original policy: subtotal > 400 gets free shipping)
      if (parsedSubtotal >= 400) {
        console.log(`ℹ️ Subtotal ${parsedSubtotal} >= ₹400. Eligible for free shipping.`);
        return res.status(200).json({
          success: true,
          shippingFee: 0,
          source: 'local_policy_free',
          message: 'Free shipping applied!',
        });
      }

      // Query Shiprocket rate calculator
      const result = await calculateShippingRate(
        pincode,
        parsedWeight,
        isCod,
        parsedSubtotal
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          shippingFee: result.rate,
          source: 'shiprocket',
          courier: result.courierName,
          etd: result.etd,
        });
      } else {
        // Professional Fallback Strategy: Use flat rate policy if Shiprocket API fails or pincode is not serviceable
        console.warn('⚠️ Shiprocket rate query failed, using fallback policy.');
        const fallbackFee = parsedSubtotal >= 400 || parsedSubtotal === 0 ? 0 : 99;
        
        return res.status(200).json({
          success: true,
          shippingFee: fallbackFee,
          source: 'fallback_flat',
          message: 'Default flat rate applied as fallback.',
        });
      }
    } catch (error) {
      console.error('Error in shipping rate controller:', error);
      // Ensure checkout flow never crashes
      const parsedSubtotal = parseFloat(req.query.subtotal || '0');
      const fallbackFee = parsedSubtotal >= 400 || parsedSubtotal === 0 ? 0 : 99;

      return res.status(200).json({
        success: true,
        shippingFee: fallbackFee,
        source: 'error_fallback',
        message: 'Default flat rate applied due to an internal error.',
      });
    }
  }
}

module.exports = new ShippingController();
