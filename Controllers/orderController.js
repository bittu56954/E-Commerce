import OrderModel from '../Models/Order.js';
import UserModel from '../Models/User.js';
import ContactModel from '../Models/Contact.js';

export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, customerDetails, paymentMethod, paymentStatus, paymentDetails, couponApplied } = req.body;

    if (!items || !items.length || !totalAmount || !customerDetails) {
      return res.status(400).json({ error: 'Please provide items, total amount, and shipping details.' });
    }

    const orderData = {
      userId: req.userId || 'guest',
      items,
      totalAmount,
      customerDetails,
      couponApplied: couponApplied || null,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || 'Pending',
      paymentDetails: paymentDetails || { transactionId: null, methodType: null, upiId: null, cardLast4: null }
    };

    const newOrder = await OrderModel.create(orderData);

    res.status(201).json({
      message: 'Order placed successfully! We are preparing your delicious meals! 🍕🍔',
      order: newOrder
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order.' });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await OrderModel.find({ userId });
    
    // Sort by date descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({});
    // Sort by date descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve all shop orders.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status value is required.' });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    let updated;
    if (status === 'Cancelled') {
      const updateData = { status: 'Cancelled' };
      if (order.paymentMethod === 'Online' && order.paymentStatus === 'Completed') {
        updateData.paymentStatus = 'Refunded';
        updateData.refundStatus = 'Completed';
        updateData.refundDetails = {
          refundAmount: order.totalAmount,
          processedAt: new Date()
        };
      }
      updated = await OrderModel.update(id, updateData);
    } else {
      updated = await OrderModel.updateStatus(id, status);
    }

    if (!updated) {
      return res.status(404).json({ error: 'Order not found in database.' });
    }

    res.status(200).json({
      message: `Order status updated to "${status}".`,
      order: updated
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OrderModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order record deleted successfully.' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Check ownership (admins can cancel any order, customers can only cancel their own)
    if (order.userId !== req.userId && !req.userIsAdmin) {
      return res.status(403).json({ error: 'Access denied. You do not own this order.' });
    }

    // Only allow cancellation of 'Pending' orders
    if (order.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot cancel order. The kitchen has already transitioned it to "${order.status}".` });
    }

    const updateData = {
      status: 'Cancelled'
    };

    // Auto refund for online payments
    if (order.paymentMethod === 'Online' && order.paymentStatus === 'Completed') {
      updateData.paymentStatus = 'Refunded';
      updateData.refundStatus = 'Completed';
      updateData.refundDetails = {
        refundAmount: order.totalAmount,
        processedAt: new Date()
      };
    }

    const updated = await OrderModel.update(id, updateData);
    res.status(200).json({
      message: 'Order was successfully cancelled and refunded if online paid.',
      order: updated
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const allOrders = await OrderModel.find({});
    const allUsers = await UserModel.find({});
    const allContacts = await ContactModel.find({});

    const totalRevenue = allOrders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const pendingOrdersCount = allOrders.filter(o => o.status !== 'Delivered').length;
    const completedOrdersCount = allOrders.filter(o => o.status === 'Delivered').length;

    // Generate telemetry logs for admin dashboard
    const activityLogs = [];
    allOrders.forEach(o => {
      activityLogs.push({
        time: o.createdAt,
        text: `Order ${o.id} placed by ${o.customerDetails.name} - Total ₹${o.totalAmount} (${o.status})`,
        type: o.status === 'Pending' ? 'warn' : 'info'
      });
    });

    activityLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      stats: {
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
        totalUsers: allUsers.length
      },
      orders: allOrders,
      contacts: allContacts,
      logs: activityLogs.slice(0, 10)
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ error: 'Failed to compile shop analytics.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    // Check ownership (admins can fetch any order, customers can only fetch their own)
    if (order.userId !== req.userId && !req.userIsAdmin) {
      return res.status(403).json({ error: 'Access denied. You do not own this order.' });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve order.' });
  }
};

