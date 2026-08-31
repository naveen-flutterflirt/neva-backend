const dotenv = require('dotenv');
dotenv.config();

let cachedToken = null;
let tokenExpiry = null; // Timestamp when token expires
let lockAuthUntil = 0;  // Timestamp to lock auth after failures

/**
 * Log in to Shiprocket and retrieve JWT token
 */
async function getShiprocketToken() {
  const now = Date.now();
  
  // Prevent hammering Shiprocket auth endpoints if previous attempts failed
  if (lockAuthUntil && now < lockAuthUntil) {
    console.warn(`⚠️ Shiprocket auth is locked to prevent account block. Cool-down active for ${Math.round((lockAuthUntil - now) / 1000)}s.`);
    return null;
  }

  // If we have a cached token that is still valid (with 1 hour buffer), return it
  if (cachedToken && tokenExpiry && now < tokenExpiry - 3600 * 1000) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️ Shiprocket credentials missing in environment variables.');
    return null;
  }

  try {
    console.log('🔄 Fetching new Shiprocket JWT Token...');
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Lock auth for 5 minutes if request is rejected
      lockAuthUntil = Date.now() + 5 * 60 * 1000;
      throw new Error(`Shiprocket auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.token) {
      cachedToken = data.token;
      // Tokens are typically valid for 10 days. We'll set expiry to 9 days to be safe.
      tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;
      lockAuthUntil = 0; // reset failures on success
      console.log('✅ Shiprocket JWT Token fetched and cached successfully.');
      return cachedToken;
    } else {
      throw new Error('No token returned in Shiprocket login response.');
    }
  } catch (error) {
    console.error('❌ Shiprocket Authentication Error:', error.message);
    // Lock auth for 5 minutes on general errors or connection issues
    if (!lockAuthUntil) {
      lockAuthUntil = Date.now() + 5 * 60 * 1000;
    }
    return null;
  }
}

/**
 * Calculate shipping charges from Shiprocket Courier Serviceability API
 * @param {string} deliveryPincode - Destination pincode
 * @param {number} weight - Weight in kg
 * @param {boolean} isCod - Whether the payment method is Cash on Delivery
 * @param {number} declaredValue - Declared value of package (cart subtotal)
 */
async function calculateShippingRate(deliveryPincode, weight = 0.5, isCod = false, declaredValue = 100) {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      throw new Error('Could not obtain Shiprocket authentication token.');
    }

    const pickupPincode = (process.env.SHIPROCKET_PICKUP_POSTCODE || '452001').trim();
    const codFlag = isCod ? 1 : 0;

    // Build Shiprocket serviceability URL with query parameters
    const url = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/');
    url.searchParams.append('pickup_postcode', pickupPincode);
    url.searchParams.append('delivery_postcode', String(deliveryPincode).trim());
    url.searchParams.append('weight', String(weight));
    url.searchParams.append('cod', String(codFlag));
    url.searchParams.append('declared_value', String(declaredValue));
    
    // Default package dimensions
    url.searchParams.append('length', '10');
    url.searchParams.append('width', '10');
    url.searchParams.append('height', '10');

    console.log(`🚚 Querying Shiprocket rates: ${pickupPincode} -> ${deliveryPincode} | COD: ${isCod} | Val: ₹${declaredValue}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shiprocket API responded with status ${response.status}: ${errorText}`);
    }

    const resData = await response.json();
    
    if (resData.status !== 200 || !resData.data || !resData.data.available_courier_companies) {
      throw new Error(resData.message || 'No courier companies available or service not available for this route.');
    }

    const couriers = resData.data.available_courier_companies;
    if (couriers.length === 0) {
      throw new Error('No available courier partners found for this pin code.');
    }

    // Filter to find the cheapest serviceability rate that is recommended
    // Standard Shiprocket rate calculations check the courier with the minimum rate.
    let cheapestCourier = null;
    let minRate = Infinity;

    for (const courier of couriers) {
      const rate = parseFloat(courier.rate);
      if (!isNaN(rate) && rate < minRate) {
        minRate = rate;
        cheapestCourier = courier;
      }
    }

    if (!cheapestCourier) {
      throw new Error('Failed to find a valid rate from serviceability response.');
    }

    console.log(`✅ Shiprocket Rate Found: ₹${minRate} via ${cheapestCourier.courier_name}`);
    return {
      success: true,
      rate: Math.ceil(minRate), // round up to whole rupees
      courierName: cheapestCourier.courier_name,
      etd: cheapestCourier.etd || '3-5 Days',
    };

  } catch (error) {
    console.error('❌ Shiprocket Rate Calculation Failure:', error.message);
    return {
      success: false,
      error: error.message || 'Rate calculation failed',
    };
  }
}

module.exports = {
  calculateShippingRate,
  getShiprocketToken
};
