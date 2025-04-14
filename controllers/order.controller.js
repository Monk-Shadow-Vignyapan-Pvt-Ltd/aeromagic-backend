import { Order } from '../models/order.model.js'; // Adjust the path as necessary

// Add a new order
export const addOrder = async (req, res) => {
    try {
        const { customerId,orderType, cartItems, status } = req.body;

        const order = new Order({
            customerId,
            orderType,
            cartItems,
            status
        });

        await order.save();
        res.status(201).json({ order, success: true });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Failed to add order', success: false });
    }
};

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("customerId");
        if (!orders ) {
            return res.status(404).json({ message: "Orders not found", success: false });
        }
        res.status(200).json({ orders, success: true });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', success: false });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order', success: false });
    }
};

// Update order by ID
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId,orderType, cartItems, status } = req.body;

        const updatedData = {
            customerId,
            orderType,
            cartItems,
            status
        };

        const order = await Order.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }

        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete order by ID
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Failed to delete order', success: false });
    }
};

// Optional: Get all distinct statuses
export const getOrderStatuses = async (req, res) => {
    try {
        const statuses = await Order.distinct("status");
        res.status(200).json({ statuses, success: true });
    } catch (error) {
        console.error('Error fetching order statuses:', error);
        res.status(500).json({ message: 'Failed to fetch order statuses', success: false });
    }
};
