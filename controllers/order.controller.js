import { Order } from '../models/order.model.js'; // Adjust the path as necessary
import { Product } from '../models/product.model.js'; 
import moment from 'moment';
import { Customer } from '../models/customer.model.js';
import nodemailer from 'nodemailer';
import axios from "axios";
import dotenv from "dotenv";
import FormData from 'form-data';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'mail.aromagicperfume.com', // Or your SMTP provider
    port: 587,
    secure: false, // true if you use port 465
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendOrderConfirmationEmail = async (to, orderId, shippingAddress, cartItems,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal,giftPacking) => {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to,
        subject: `Your Order ${orderId} has been placed!`,
        html: `
        <!DOCTYPE html>
      <html>
      <head>
       
      </head>
      <body >
      <div
  style="
    background-color: rgb(255, 255, 255);
    color: rgb(31, 41, 55);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    padding: 24px;
    max-width: 600px;
    margin: 0px auto;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;
    border: 1px solid rgb(229, 231, 235);
  "
>
  <style>
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
    }
    @keyframes flap-left {
      0% {
        transform: rotate(-10deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
    @keyframes flap-right {
      0% {
        transform: rotate(10deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
    .left-wing {
      animation: flap-left 1s infinite alternate ease-in-out;
      transform-origin: 40% 50%;
    }
    .right-wing {
      animation: flap-right 1s infinite alternate ease-in-out;
      transform-origin: 60% 60%;
    }
    /* Fallback for email clients that don't support animations */
    .no-animation .left-wing,
    .no-animation .right-wing {
      animation: none !important;
    }
    /* Reset some email client styles */
    .ExternalClass,
    .ReadMsgBody {
      width: 100%;
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
      line-height: 100%;
    }
  </style>
  <div
    class="no-animation"
    style="display: none; max-height: 0px; overflow: hidden; visibility: hidden"
  >
    Your email client doesn't support animations. Here's a static version of our
    logo.
  </div>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    "
  >
    <a
      href="https://aromagicperfume.com/"
      aria-label="logo-brand"
      style="text-decoration: none"
      ><img style="width: 150px; height: auto;" src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo"></a>
  </div>
  <h2
    style="
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
    "
  >
    🛍️ Thank You for Your Order!
  </h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding-bottom: 24px">
        <p style="margin: 0px 0px 8px">Hello <strong>${shippingAddress.honorific}. ${shippingAddress.fullName || "Customer"}</strong>,</p>
        <p style="margin: 0px">
          We've received your order <strong>${orderId}</strong> and it's being
          processed. Below are the details:
        </p>
      </td>
    </tr>
  </table>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      border: 1px solid rgb(229, 231, 235);
      border-radius: 8px;
      margin-bottom: 24px;
    "
  >
    <tr>
      <td style="padding: 16px">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0px 0px 8px">
          Order Summary
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <thead>
            <tr>
              <th
                align="left"
                style="
                  padding: 8px 0px;
                  font-weight: 600;
                  border-bottom: 1px solid rgb(229, 231, 235);
                "
              >
                Product
              </th>
              <th
                align="left"
                style="
                  padding: 8px 0px;
                  font-weight: 600;
                  border-bottom: 1px solid rgb(229, 231, 235);
                "
              >
                Quantity
              </th>
              <th
                align="right"
                style="
                  padding: 8px 0px;
                  font-weight: 600;
                  border-bottom: 1px solid rgb(229, 231, 235);
                "
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
           ${cartItems
  .map(
    (item) => `
<tr>
  <td
    style="padding: 8px 0px; border-bottom: 1px solid rgb(229, 231, 235);"
  >
    ${item.name}
  </td>
  <td
    style="padding: 8px 0px; border-bottom: 1px solid rgb(229, 231, 235);"
  >
    ${item.quantity}
  </td>
  <td
    align="right"
    style="padding: 8px 0px; border-bottom: 1px solid rgb(229, 231, 235);"
  >
    ₹${item.price * item.quantity}
  </td>
</tr>`
  )
  .join('')}
          </tbody>
        </table>
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 16px"
        >
          <tr>
            <td align="right">
              <p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600">Subtotal:</span> ₹${subtotal}
              </p>
               <p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600">Discount:</span> ₹${totalDiscount}
              </p>
              <p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600">Coupon Discount:</span> ₹${couponDiscount}
              </p>
              <p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600">Shipping:</span> ₹${shippingCharge}
              </p>
               ${giftPacking ? `<p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
              <span style="font-weight: 600">Gift Packing:</span> ₹100
              </p>` : ""}
              <p
                style="
                  margin: 8px 0px;
                  font-size: 16px;
                  font-weight: 600;
                  width: 100%;
                  max-width: 180px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600">Total:</span> ₹${finalTotal}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="margin-bottom: 24px"
  >
    <tr>
      <td>
        <h3 style="font-size: 18px; font-weight: 600; margin: 0px 0px 8px">
          Shipping Information
        </h3>
        <p style="margin: 8px 0px">${shippingAddress.honorific}. ${shippingAddress.fullName}</p>
        <p style="margin: 8px 0px">${shippingAddress.flat}, ${shippingAddress.area}</p>
        <p style="margin: 8px 0px">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}</p>
        <p style="margin: 8px 0px">India</p>
        <p style="margin: 8px 0px">Phone: +91 ${shippingAddress.phone}</p>
      </td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td
        align="center"
        style="padding-top: 32px; font-size: 14px; color: rgb(107, 114, 128)"
      >
        Thank you for shopping with AroMagic Perfume ✨ <br />
      </td>
    </tr>
  </table>
  <div
    style="
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: rgb(107, 114, 128);
    "
  >
    <p>Follow us: Instagram | Facebook | Twitter</p>
    <p style="margin-top: 8px">
      Need help?
      <a
        href="mailto:support@aromagicperfume.com"
        style="color: rgb(219, 39, 119); text-decoration: underline"
        >support@aromagicperfume.com</a
      >
    </p>
    <p style="margin-top: 16px">© 2025 AroMagic Perfume</p>
    <!-- <div style="margin-top: 4px">
      <a href="#" style="text-decoration: underline; margin-right: 8px"
        >Privacy Policy</a
      >
      |
      <a href="#" style="text-decoration: underline; margin-left: 8px"
        >Unsubscribe</a
      >
    </div>-->
  </div>
</div>
        </body>
      </html>
      `,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Add a new order
export const addOrder = async (req, res) => {
    try {
        const { customerId, orderType, cartItems, status, shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage } = req.body;

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
            shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage
        });

        await order.save();
        const customer = await Customer.findById(customerId);
        if (customer?.email) {
          await sendOrderConfirmationEmail(customer.email, orderId, shippingAddress,cartItems,subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal,giftPacking);
        }

        res.status(201).json({ order, success: true });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Failed to add order', success: false });
    }
};

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const { status = "All", startDate, endDate, page = 1, limit = 12, search = "",orderType= "" } = req.query;

        const filter = {};

        // Filter by status
        if (status !== "All") {
            filter.status = status;
        }

        if(orderType){
            filter.orderType = orderType;
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
        // Fetch orders
        const orders = await Order.find(filter)
            .select('-returnItems')
            .populate("customerId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Login to Selloship once
        const loginForm = new FormData();
        loginForm.append("email", process.env.SELLOSHIP_EMAIL);
        loginForm.append("password", process.env.SELLOSHIP_PASSWORD);

        const loginResponse = await axios.post(
            'https://selloship.com/api/lock_actvs/Vendor_login_from_vendor_all_order',
            loginForm,
            {
                headers: {
                    Authorization: '9f3017fd5aa17086b98e5305d64c232168052b46c77a3cc16a5067b',
                    ...loginForm.getHeaders(),
                },
            }
        );

        if (loginResponse.data.success !== "1") {
            return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
        }

        // Enrich orders with Selloship tracking info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            if (!order.selloShipAWB) {
                return { ...order.toObject(), trackingInfo: null };
            }

            const trackForm = new FormData();
            trackForm.append("vendor_id", loginResponse.data.vendor_id);
            trackForm.append("device_from", loginResponse.data.device_from);
            trackForm.append("tracking_id", order.selloShipAWB);

            try {
                const trackResponse = await axios.post(
                    'https://selloship.com/api/lock_actvs/tracking_detail',
                    trackForm,
                    {
                        headers: {
                            Authorization: loginResponse.data.access_token,
                            ...trackForm.getHeaders(),
                        },
                    }
                );

                const statusCode = trackResponse.data.status_code;

                // Determine new status
                const newStatus =
                    statusCode === "2" ? "Shipped" :
                        statusCode === "3" ? "Delivered" :
                            statusCode === "4" || statusCode === "5" ? "Returned" :
                                statusCode === "6" ? "Cancelled" :
                                    "Processing";

                // Update the order in the database if status changed
                if (order.status !== newStatus) {
                    await Order.findByIdAndUpdate(order._id, { status: newStatus });
                }

                return {
                    ...order.toObject(),
                    trackingInfo: trackResponse.data,
                    status: newStatus,
                };

            } catch (err) {
                console.error(`Tracking failed for order ${order._id}:`, err.message);
                return {
                    ...order.toObject(),
                    trackingInfo: null,
                };
            }
        }));


        // Filter by customer name (if search query is given)
        const enrichedOrdersWithImages = await Promise.all(enrichedOrders.map(async (order) => {
            const updatedCartItems = await Promise.all(order.cartItems.map(async (item) => {
                try {
                    let cleanProductId = item.id;

                    if (item.hasVariations && typeof item.id === "string" && item.id.includes("_")) {
                        cleanProductId = item.id.split("_")[0];
                    }
        
                    const product = await Product.findById(cleanProductId).select("productImage"); // or item._id if it's stored directly
                    return {
                        ...item,
                        img: product?.productImage || null, // fallback if img is not found
                    };
                } catch (err) {
                    console.error(`Failed to fetch product for item in order ${order._id}:`, err.message);
                    return item; // return item as-is if fetch fails
                }
            }));
        
            return {
                ...order,
                cartItems: updatedCartItems,
            };
        }));
        
        let finalOrders = enrichedOrdersWithImages;
        if (search && search.trim() !== "") {
            const lowerSearch = search.toLowerCase();
            finalOrders = enrichedOrdersWithImages.filter(order =>
                order.customerId?.fullname?.toLowerCase().includes(lowerSearch)
            );
        }

        // Final response
        res.status(200).json({
            orders: finalOrders,
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
        const orders = await Order.find({ customerId }).select('-returnItems.returnVideo').sort({ createdAt: -1 });
        const loginForm = new FormData();
        loginForm.append("email", process.env.SELLOSHIP_EMAIL);
        loginForm.append("password", process.env.SELLOSHIP_PASSWORD);

        const loginResponse = await axios.post(
            'https://selloship.com/api/lock_actvs/Vendor_login_from_vendor_all_order',
            loginForm,
            {
                headers: {
                    Authorization: '9f3017fd5aa17086b98e5305d64c232168052b46c77a3cc16a5067b',
                    ...loginForm.getHeaders(),
                },
            }
        );

        if (loginResponse.data.success !== "1") {
            return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
        }

        // Enrich orders with Selloship tracking info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            if (!order.selloShipAWB) {
                return { ...order.toObject(), trackingInfo: null };
            }

            const trackForm = new FormData();
            trackForm.append("vendor_id", loginResponse.data.vendor_id);
            trackForm.append("device_from", loginResponse.data.device_from);
            trackForm.append("tracking_id", order.selloShipAWB);

            try {
                const trackResponse = await axios.post(
                    'https://selloship.com/api/lock_actvs/tracking_detail',
                    trackForm,
                    {
                        headers: {
                            Authorization: loginResponse.data.access_token,
                            ...trackForm.getHeaders(),
                        },
                    }
                );

                const statusCode = trackResponse.data.status_code;

                // Determine new status
                const newStatus =
                    statusCode === "2" ? "Shipped" :
                        statusCode === "3" ? "Delivered" :
                            statusCode === "4" || statusCode === "5" ? "Returned" :
                                statusCode === "6" ? "Cancelled" :
                                    "Processing";

                // Update the order in the database if status changed
                if (order.status !== newStatus) {
                    await Order.findByIdAndUpdate(order._id, { status: newStatus });
                }

                return {
                    ...order.toObject(),
                    trackingInfo: trackResponse.data,
                    status: newStatus,
                };

            } catch (err) {
                console.error(`Tracking failed for order ${order._id}:`, err.message);
                return {
                    ...order.toObject(),
                    trackingInfo: null,
                };
            }
        }));
        const enrichedOrdersWithImages = await Promise.all(enrichedOrders.map(async (order) => {
            const updatedCartItems = await Promise.all(order.cartItems.map(async (item) => {
                try {
                    let cleanProductId = item.id;

                    if (item.hasVariations && typeof item.id === "string" && item.id.includes("_")) {
                        cleanProductId = item.id.split("_")[0];
                    }
        
                    const product = await Product.findById(cleanProductId).select("productImage"); // or item._id if it's stored directly
                    return {
                        ...item,
                        img: product?.productImage || null, // fallback if img is not found
                    };
                } catch (err) {
                    console.error(`Failed to fetch product for item in order ${order._id}:`, err.message);
                    return item; // return item as-is if fetch fails
                }
            }));
        
            return {
                ...order,
                cartItems: updatedCartItems,
            };
        }));
        if (!enrichedOrdersWithImages) {
            return res.status(404).json({ message: "Orders not found", success: false });
        }
        res.status(200).json({ orders:enrichedOrdersWithImages, success: true });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', success: false });
    }
};



// Update order by ID
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { returnItems } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { returnItems }, // ✅ only updating this field
            { new: true, runValidators: true }
        );

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

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndUpdate(id, { status: "Cancelled" });;
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error cancel order:', error);
        res.status(500).json({ message: 'Failed to cancel order', success: false });
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

export const getReturnOrders = async (req, res) => {
    try {
        const {
            approvalStatus = "",
            startDate,
            endDate,
            page = 1,
            limit = 12,
            search = "",
            orderType = "",
            returnType = ""
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const baseFilter = {
            returnItems: { $exists: true, $ne: [] } // Only orders with return items
        };

        // Filter inside returnItems object
        if (approvalStatus) {
            baseFilter["returnItems.approvalStatus"] = approvalStatus;
        }

        if (returnType) {
            baseFilter["returnItems.returnType"] = returnType;
        }

        if (orderType) {
            baseFilter.orderType = orderType;
        }

        if (startDate && endDate) {
            baseFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Fetch all orders matching base filters
        let allOrders = await Order.find(baseFilter)
            .populate("customerId")
            .sort({ createdAt: -1 });

        // Prioritize search by customer name
        if (search.trim() !== "") {
            const lowerSearch = search.toLowerCase();
            allOrders = allOrders.filter(order =>
                order.customerId?.fullname?.toLowerCase().includes(lowerSearch)
            );
        }

        const totalOrders = allOrders.length;

        // Paginate after filtering
        const paginatedOrders = allOrders.slice(skip, skip + parseInt(limit));

        // Enrich return items with product images
        const enrichedOrders = await Promise.all(paginatedOrders.map(async (order) => {
            const updatedItems = await Promise.all(order.returnItems.items.map(async (item) => {
                try {
                    let cleanProductId = item.id;
                    if (item.hasVariations && typeof item.id === "string" && item.id.includes("_")) {
                        cleanProductId = item.id.split("_")[0];
                    }
                    const product = await Product.findById(cleanProductId).select("productImage");
                    return { ...item, img: product?.productImage || null };
                } catch (err) {
                    console.error(`Failed to fetch product for item in order ${order._id}:`, err.message);
                    return item;
                }
            }));

            return {
                ...order.toObject(),
                returnItems: {
                    ...order.returnItems,
                    items: updatedItems
                }
            };
        }));

        res.status(200).json({
            orders: enrichedOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: parseInt(page),
            success: true
        });

    } catch (error) {
        console.error("Error fetching return orders:", error);
        res.status(500).json({ message: "Failed to fetch return orders", success: false });
    }
};


