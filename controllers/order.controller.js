import { Order } from '../models/order.model.js'; // Adjust the path as necessary
import moment from 'moment';

// Add a new order
export const addOrder = async (req, res) => {
    try {
        const { customerId,orderType, cartItems, status ,shippingAddress,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal,giftPacking,removePriceFromInvoice ,addGiftMessage,giftMessage} = req.body;

        const now = new Date();
        const formattedDate = moment(now).format('DD-MM-YYYY');
        const prefix = 'AM';

        // Count how many orders exist for today
        const dateStart = moment().startOf('day').toDate();
        const dateEnd = moment().endOf('day').toDate();

        const todayOrders = await Order.find({
            createdAt: { $gte: dateStart, $lte: dateEnd },
            orderId: { $regex: `^${prefix}-${formattedDate}-` }
        });

        const orderNumber = String(todayOrders.length + 1).padStart(4, '0');
        const orderId = `${prefix}-${formattedDate}-${orderNumber}`;

        const order = new Order({
            customerId,
            orderType,
            cartItems,
            status,
            orderId,
            shippingAddress,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal ,giftPacking,removePriceFromInvoice ,addGiftMessage,giftMessage
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
        const { status = "All", startDate, endDate, page = 1, limit = 12, search = "" } = req.query;

        const filter = {};

        // Filter by status
        if (status !== "All") {
            filter.status = status;
        }

        // Filter by date range
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Search filter (case-insensitive)
        // if (search.trim() !== "") {
        //     const regex = new RegExp(search, "i");
        //     filter.$or = [
        //         { orderId: regex },
        //         { "cartItems.productName": regex }, // assumes `productName` in `cartItems`
        //     ];
        // }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customerId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // If you want to search by customer name (populated), you need aggregation
        if (search && orders.length > 0) {
            const lowerSearch = search.toLowerCase();
            const filteredByCustomer = orders.filter(order =>
                order.customerId?.fullname?.toLowerCase().includes(lowerSearch)
            );
           

            return res.status(200).json({
                orders: filteredByCustomer,
                totalPages: Math.ceil(filteredByCustomer.length / limit),
                currentPage: parseInt(page),
                success: true
            });
        }

        res.status(200).json({
            orders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: parseInt(page),
            success: true
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", success: false });
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

export const getOrdersByCustomerId = async (req, res) => {
    try {
        const customerId = req.params.id;
        const orders = await Order.find({customerId}).sort({ createdAt: -1 });
        if (!orders) {
            return res.status(404).json({ message: "Orders not found", success: false });
        }
        res.status(200).json({ orders, success: true });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', success: false });
    }
};



// Update order by ID
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId,orderType, cartItems, status,shippingAddress,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking,removePriceFromInvoice ,addGiftMessage,giftMessage } = req.body;

        const updatedData = {
            customerId,
            orderType,
            cartItems,
            status,
            shippingAddress,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal ,giftPacking,removePriceFromInvoice ,addGiftMessage,giftMessage
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
