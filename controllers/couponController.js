const { Coupon, Order } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching coupons',
      error: error.message,
    });
  }
};

// @desc    Get active public coupons (Customer)
// @route   GET /api/coupons/public
// @access  Public
exports.getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        showInPublicList: true,
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: null },
              { startDate: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } },
            ],
          },
        ],
      },
      attributes: [
        'id',
        'code',
        'description',
        'discountType',
        'discountValue',
        'maxDiscountAmount',
        'minOrderAmount',
        'applicableUser',
        'endDate',
      ],
      order: [['minOrderAmount', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching public coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching available coupons',
    });
  }
};

// @desc    Create a new coupon (Admin)
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      applicableUser,
      usageLimitTotal,
      usageLimitPerUser,
      showInPublicList,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and discount value are required',
      });
    }

    const formattedCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ where: { code: formattedCode } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${formattedCode}" already exists`,
      });
    }

    const coupon = await Coupon.create({
      code: formattedCode,
      description: description || null,
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      applicableUser: applicableUser || 'all',
      usageLimitTotal: usageLimitTotal ? parseInt(usageLimitTotal) : null,
      usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : 1,
      showInPublicList: showInPublicList !== undefined ? showInPublicList : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating coupon',
      error: error.message,
    });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      applicableUser,
      usageLimitTotal,
      usageLimitPerUser,
      showInPublicList,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (code) {
      const formattedCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({
        where: { code: formattedCode, id: { [Op.ne]: id } },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${formattedCode}" is already taken`,
        });
      }
      coupon.code = formattedCode;
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = parseFloat(discountValue);
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    }
    if (minOrderAmount !== undefined) coupon.minOrderAmount = parseFloat(minOrderAmount) || 0;
    if (applicableUser !== undefined) coupon.applicableUser = applicableUser;
    if (usageLimitTotal !== undefined) {
      coupon.usageLimitTotal = usageLimitTotal ? parseInt(usageLimitTotal) : null;
    }
    if (usageLimitPerUser !== undefined) {
      coupon.usageLimitPerUser = parseInt(usageLimitPerUser) || 1;
    }
    if (showInPublicList !== undefined) coupon.showInPublicList = showInPublicList;
    if (startDate !== undefined) coupon.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) coupon.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating coupon',
      error: error.message,
    });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    await coupon.destroy();

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting coupon',
      error: error.message,
    });
  }
};

// @desc    Validate & Apply Coupon (Customer)
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, userId, customerEmail } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code',
      });
    }

    const cartSubtotal = parseFloat(subtotal) || 0;
    const formattedCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({
      where: { code: formattedCode },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code. Please check and try again.',
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active.',
      });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: `This coupon will be active from ${new Date(coupon.startDate).toLocaleDateString()}.`,
      });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired.',
      });
    }

    // Check Total Usage Limit
    if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit.',
      });
    }

    // Check Minimum Order Amount
    const minOrder = parseFloat(coupon.minOrderAmount) || 0;
    if (cartSubtotal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${minOrder.toLocaleString('en-IN')} required to use this coupon. (Cart: ₹${cartSubtotal.toLocaleString('en-IN')})`,
      });
    }

    // Check "New Customer Only" Eligibility
    if (coupon.applicableUser === 'new_customer') {
      const userCondition = [];
      if (userId) userCondition.push({ userId });
      if (customerEmail) userCondition.push({ customerEmail });

      if (userCondition.length > 0) {
        const previousOrders = await Order.count({
          where: {
            [Op.or]: userCondition,
          },
        });

        if (previousOrders > 0) {
          return res.status(400).json({
            success: false,
            message: 'This promo code is strictly reserved for first-time customers only.',
          });
        }
      }
    }

    // Check Per-User Usage Limit
    if (coupon.usageLimitPerUser && (userId || customerEmail)) {
      const userCondition = [];
      if (userId) userCondition.push({ userId });
      if (customerEmail) userCondition.push({ customerEmail });

      const userUsageCount = await Order.count({
        where: {
          couponCode: formattedCode,
          [Op.or]: userCondition,
        },
      });

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return res.status(400).json({
          success: false,
          message: `You have already used this coupon maximum (${coupon.usageLimitPerUser}) time(s).`,
        });
      }
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    const discountVal = parseFloat(coupon.discountValue);

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * discountVal) / 100);
      if (coupon.maxDiscountAmount) {
        const maxCap = parseFloat(coupon.maxDiscountAmount);
        if (discountAmount > maxCap) {
          discountAmount = maxCap;
        }
      }
    } else {
      // Flat amount
      discountAmount = Math.min(cartSubtotal, Math.round(discountVal));
    }

    return res.status(200).json({
      success: true,
      message: `🎉 Coupon "${coupon.code}" applied successfully! You saved ₹${discountAmount.toLocaleString('en-IN')}`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountVal,
        maxDiscountAmount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : null,
        discountAmount,
        minOrderAmount: minOrder,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating coupon',
      error: error.message,
    });
  }
};
