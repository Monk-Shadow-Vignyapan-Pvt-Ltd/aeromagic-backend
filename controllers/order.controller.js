import { Order } from '../models/order.model.js'; // Adjust the path as necessary
import { Product } from '../models/product.model.js';
import moment from 'moment';
import { Customer } from '../models/customer.model.js';
import nodemailer from 'nodemailer';
import axios from "axios";
import dotenv from "dotenv";
import FormData from 'form-data';
import cron from "node-cron";

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

const sendOrderConfirmationEmail = async (to, orderId, shippingAddress, cartItems, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    cc: process.env.CC_EMAIL,
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
      style="text-decoration: none; margin-left: auto; margin-right: auto;"
      ><img style="width: 150px; height: auto;" src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" /></a>
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
        GST No. 24ABJFR1038F1ZG <br />
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
    <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a> </p>
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
      await sendOrderConfirmationEmail(customer.email, orderId, shippingAddress, cartItems, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking);
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
    const { status = "All", startDate, endDate, page = 1, limit = 12, search = "", orderType = "" } = req.query;

    const filter = {};

    // Filter by status
    if (status !== "All") {
      filter.status = status;
    }

    if (orderType) {
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
          // if (newStatus === "Shipped" || newStatus === "Delivered" || newStatus === "Returned"){
          //       await sendOrderStatusUpdateEmail(order.customerId.email, order.orderId, order.customerId?.fullname, newStatus, order.selloShipAWB)
          // }
            
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
    res.status(200).json({ orders: enrichedOrdersWithImages, success: true });
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
    
    if(returnItems.approvalStatus ==="Pending"){
      await returnRequestMail(order);
    }else if (returnItems.approvalStatus ==="Approved"){
      await returnApproveMail(order);
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
     await cancelOrderMail(order);
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

const sendOrderStatusUpdateEmail = async (to, orderId, name, status, selloShipAWB) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject: `Order Status Update For ${orderId}`,
    html: `
        <!DOCTYPE html>
      <html>
      <head>
       <style>
       .status-line{
                          position: absolute;
                          top: 10px;
                          left: 50%;       
       }
                          .relative{
                          position: relative;
                          }
       </style>
      </head>
      <body >
      <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: rgb(255, 255, 255);
        font-family: 'Helvetica Neue', Arial, sans-serif;
        max-width: 600px;
        margin: 0px auto;
        border: 1px solid rgb(229, 231, 235);
        border-radius: 8px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;
      "
    >
      <tr>
        <td style="padding: 24px">
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
            style="
              display: none;
              max-height: 0px;
              overflow: hidden;
              visibility: hidden;
            "
          >
            Your email client doesn't support animations. Here's a static
            version of our logo.
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
              style="text-decoration: none; margin-left: auto; margin-right: auto;"
              ><img style="width: 150px; height: auto;" src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" /></a>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td
                align="center"
                style="font-size: 24px; font-weight: 600; padding-bottom: 32px"
              >
                📦 Order Status Update
              </td>
            </tr>
          </table>
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="padding-bottom: 24px"
          >
            <tr>
              <td>
                <p style="margin: 0px 0px 8px">
                  Hi <strong>${name}</strong>,
                </p>
                <p style="margin: 0px 0px 8px">
                  The status of your order <strong>${orderId}</strong> has been
                  updated to:
                </p>
                <p
                  style="
                    font-size: 18px;
                    font-weight: 700;
                    color:  ${status === "Returned" ? 'rgb(255, 55, 55)' : status === "Delivered" ? 'rgb(34, 197, 94)' : 'rgb(209, 213, 219)'}              
                    margin: 8px 0px 16px;
                    text-transform: capitalize;
                  "
                >
                   ${status === "Returned" ? 'Returned' : status === "Delivered" ? 'Delivered' : 'Shipped'}
                </p>
                ${status === "Shipped" ? "<p style='margin: 16px 0px 0px'>Your order is on its way 🚚</p>" : status === "Delivered" ? "<p style='margin: 16px 0px 0px'>Your order is Delivered</p>" : "<p style='margin: 16px 0px 0px'>Your order is Returned</p>"}
              </td>
            </tr>
          </table>
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin: 24px 0px"
          >
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="width: 25%">
                    <div style="display: inline-block; vertical-align: middle;">
                      <div
                        style="
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background-color: rgb(34, 197, 94);
                          margin: 0px auto;
                          position: relative;
                          z-index: 10;
                        "
                      ></div>
                      <div
                        style="
                          font-size: 12px;
                          margin-top: 8px;
                          color: rgb(34, 197, 94);
                          font-weight: 600;
                          text-transform: capitalize;
                        "
                      >
                        Pending
                      </div>
                        <div style="width: 100%; height: 2px; margin-top: 2px; background-color: rgb(37,99,235); vertical-align: middle;"></div>
                      </div>
                    </td>
                     
                    <td align="center" style="width: 25%">
                      <div style="display: inline-block; vertical-align: middle;">
                      <div
                        style="
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background-color: rgb(34, 197, 94);
                          margin: 0px auto;
                          position: relative;
                          z-index: 10;
                        "
                      ></div>
                      <div
                        style="
                          font-size: 12px;
                          margin-top: 8px;
                          color: rgb(34, 197, 94);
                          font-weight: 600;
                          text-transform: capitalize;
                        "
                      >
                        Packing
                      </div>
                        <div style="width: 100%; height: 2px; margin-top: 2px; background-color: rgb(37,99,235); vertical-align: middle;"></div>
                       </div>
                       
                    </td>
                    
                    <td align="center" style="width: 25%">
                      <div style="display: inline-block; vertical-align: middle;">
                      <div
                        style="
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background-color: rgb(34, 197, 94);
                          margin: 0px auto;
                          position: relative;
                          z-index: 10;
                        "
                      ></div>
                      <div
                        style="
                          font-size: 12px;
                          margin-top: 8px;
                          color: rgb(34, 197, 94);
                          font-weight: 600;
                          text-transform: capitalize;
                        "
                      >
                        Shipped
                      </div>
                        <div style="width: 100%; height: 2px; margin-top: 2px; background-color: rgb(37,99,235); vertical-align: middle;"></div>
                       </div>
                     
                    </td>
                     
                    <td align="center" style="width: 25%">
                        <div style="display: inline-block; vertical-align: middle;">
                        <div
                          style="
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background-color: ${status === "Returned" ? 'rgb(255, 55, 55)' : status === "Delivered" ? 'rgb(34, 197, 94)' : 'rgb(209, 213, 219)'} ;
                            margin: 0px auto;
                            position: relative;
                            z-index: 10;
                          "
                        ></div>
                        <div
                          style="
                            font-size: 12px;
                            margin-top: 8px;
                            color: ${status === "Returned" ? 'rgb(255, 55, 55)' : status === "Delivered" ? 'rgb(34, 197, 94)' : 'rgb(209, 213, 219)'};
                            font-weight: 400;
                            text-transform: capitalize;
                          "
                        >
                          ${status === "Returned" ? 'Returned' : status === "Delivered" ? 'Delivered' : 'Delivered'}
                        </div>
                       <div style="width: 100%; height: 2px; margin-top: 2px; background-color: ${status === "Returned" ? 'rgb(255, 55, 55)' : status === "Delivered" ? 'rgb(34, 197, 94)' : 'rgb(209, 213, 219)'}; vertical-align: middle;"></div>
                      </div>
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
            style="margin: 32px 0px"
          >
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      align="center"
                      bgcolor="#000"
                      style="border-radius: 6px; padding: 12px 24px"
                    >
                      <a
                        href="https://selloship.com/pages/tracking/${selloShipAWB}"
                        style="
                          color: rgb(255, 255, 255);
                          text-decoration: none;
                          font-size: 14px;
                          font-weight: 600;
                          display: inline-block;
                        "
                        >Track My Order</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td
                align="center"
                style="
                  padding-top: 32px;
                  font-size: 14px;
                  color: rgb(107, 114, 128);
                "
              >
                Thank you for choosing AroMagic Perfume ✨
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
            <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
            <p style="margin-top: 8px">
              Need help?
              <a
                href="mailto:support@aromagicperfume.com"
                style="color: rgb(219, 39, 119); text-decoration: underline"
                >support@aromagicperfume.com</a
              >
            </p>
            <p style="margin-top: 16px">© 2025 AroMagic Perfume</p>
            <div style="margin-top: 4px">
              <a href="#" style="text-decoration: underline; margin-right: 8px"
                >Privacy Policy</a
              >
              |
              <a href="#" style="text-decoration: underline; margin-left: 8px"
                >Unsubscribe</a
              >
            </div>
          </div>
        </td>
      </tr>
    </table>

        </body>
      </html>
      `,
  };

  //return transporter.sendMail(mailOptions);
  try {
    await transporter.sendMail(mailOptions);
    console.log('Order Update Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const updateOrderStatusesAndSendEmails = async () => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  try {
    const orders = await Order.find({
      createdAt: { $gte: fourteenDaysAgo },
      selloShipAWB: { $exists: true, $ne: null }
    }).select('-returnItems').populate("customerId");

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
      console.error("Selloship login failed", loginResponse.data);
      return;
    }

    for (const order of orders) {
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
        const newStatus =
          statusCode === "2" ? "Shipped" :
            statusCode === "3" ? "Delivered" :
              statusCode === "4" || statusCode === "5" ? "Returned" :
                statusCode === "6" ? "Cancelled" :
                  "Processing";

        if (order.status !== newStatus) {
          await Order.findByIdAndUpdate(order._id, { status: newStatus });

          if (newStatus === "Shipped" || newStatus === "Delivered" || newStatus === "Returned"){
                await sendOrderStatusUpdateEmail(order.customerId.email, order.orderId, order.customerId?.fullname, newStatus, order.selloShipAWB)
          }

          console.log(`Status updated and email sent for order ${order.orderId}`);
        }
      } catch (err) {
        console.error(`Tracking failed for order ${order._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Cron job error:", err.message);
  }
};

// Schedule the job: every day at 9 PM
cron.schedule("0 21 * * *", () => {
  console.log("Running order status update cron at 9 PM");
  updateOrderStatusesAndSendEmails();
});

const returnRequestMail = async (order) => {
  const returnOrder = await Order.findOne({_id :order._id})
      .select('-returnItems.returnVideo')
      .populate("customerId");


       const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
   <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: rgb(255, 255, 255);
        font-family: Arial, sans-serif;
        color: rgb(51, 51, 51);
        max-width: 600px;
        margin: 0px auto;
        border: 1px solid rgb(229, 231, 235);
        border-radius: 8px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;
      "
    >
      <tr>
        <td style="padding: 24px">
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
            style="
              display: none;
              max-height: 0px;
              overflow: hidden;
              visibility: hidden;
            "
          >
            Your email client doesn't support animations. Here's a static
            version of our logo.
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 32px;
            "
          >
             <a href="https://aromagicperfume.com/" style="text-decoration: none; margin-left: auto; margin-right: auto;"><img src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" style="width: 150px; height: auto;"></a>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td
                align="center"
                style="font-size: 20px; font-weight: 600; padding-bottom: 32px"
              >
                🔄 Return / Replacement Request Received
              </td>
            </tr>
          </table>
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin-bottom: 24px; font-size: 14px"
          >
            <tr>
              <td>
                <p style="margin: 0px 0px 8px">Hi <strong>${returnOrder.customerId.fullname}</strong>,</p>
                <p style="margin: 8px 0px">
                  We've received your request for a
                  <strong>${returnOrder.returnItems.returnType}</strong> regarding order
                  <strong>${returnOrder.orderId}</strong>.
                </p>
                <p style="margin: 16px 0px 0px">
                  Our team is currently reviewing your request. You'll receive
                  an update shortly once it's approved or if we need more
                  details.
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
              background-color: rgb(249, 250, 251);
              border: 1px solid rgb(229, 231, 235);
              border-radius: 6px;
              margin-bottom: 24px;
            "
          >
            <tr>
              <td style="padding: 16px; font-size: 14px">
                <p style="margin: 0px 0px 8px">
                  <strong>Request Type:</strong> ${returnOrder.returnItems.returnType === "return" ? "Return" : "Exchange"}
                </p>
                <p style="margin: 8px 0px">
                  <strong>Order ID:</strong>${returnOrder.orderId}
                </p>
                <p style="margin: 8px 0px 0px">
                  <strong>Requested On:</strong>${new Date(returnOrder.updatedAt).toLocaleString('en-IN', {
                                                              timeZone: 'Asia/Kolkata', // Indian Standard Time
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                              hour: 'numeric',
                                                              minute: '2-digit',
                                                              hour12: true
                                                            })}
                </p>
              </td>
            </tr>
          </table>
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin: 24px 0px"
          >
           
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td
                align="center"
                style="
                  padding-top: 32px;
                  font-size: 14px;
                  color: rgb(107, 114, 128);
                "
              >
                Thank you for choosing AroMagic Perfume ✨
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
           <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
            <p style="margin-top: 8px">
              Need help?
              <a
                href="mailto:support@aromagicperfume.com"
                style="color: rgb(219, 39, 119); text-decoration: underline"
                >support@aromagicperfume.com</a
              >
            </p>
            <p style="margin-top: 16px">© 2025 AroMagic Perfume</p>
            <div style="margin-top: 4px">
              <a href="#" style="text-decoration: underline; margin-right: 8px"
                >Privacy Policy</a
              >
              |
              <a href="#" style="text-decoration: underline; margin-left: 8px"
                >Unsubscribe</a
              >
            </div>
          </div>
        </td>
      </tr>
    </table>
</body>
</html>
`;
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to : returnOrder.customerId.email,
        cc:process.env.CC_EMAIL,
        subject: `Return / Replacement Request Received For ${returnOrder.orderId}!`,
        html: htmlContent,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Return/Exchange Request email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
  
}

const returnApproveMail = async (order) => {
  const returnOrder = await Order.findOne({_id :order._id})
      .select('-returnItems.returnVideo')
      .populate("customerId");


       const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
    <div
      style="
        background-color: rgb(255, 255, 255);
        font-family: Arial, sans-serif;
        color: rgb(51, 51, 51);
        width: 100%;
        max-width: 600px;
        margin: 0px auto;
        padding: 24px;
        border-radius: 8px;
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
        style="
          display: none;
          max-height: 0px;
          overflow: hidden;
          visibility: hidden;
        "
      >
        Your email client doesn't support animations. Here's a static version of
        our logo.
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        "
      >
         <a href="https://aromagicperfume.com/" style="text-decoration: none; margin-left: auto; margin-right: auto;"><img src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" style="width: 150px; height: auto;"></a>
      </div>
      <h2
        style="
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
        "
      >
        ✅ Return/Replacement Request Approved
      </h2>
      <div style="font-size: 14px; line-height: 1.6; margin-bottom: 24px">
        <p>Hi <strong>${returnOrder.customerId.fullname}</strong>,</p>
        <p>
          Your replacement request for order <strong>${returnOrder.orderId}</strong> has
          been <strong>Accepted</strong>.
        </p>
        
      </div>
      <div
        style="
          background-color: rgb(249, 250, 251);
          padding: 16px;
          border-radius: 6px;
          border: 1px solid rgb(229, 231, 235);
          margin-bottom: 24px;
          font-size: 14px;
        "
      >
        <p style="margin-bottom: 8px">
          <span style="font-weight: 600">Request Type:</span> ${returnOrder.returnItems.returnType === "return" ? "Return" : "Exchange"}
        </p>
        <p style="margin-bottom: 8px">
          <span style="font-weight: 600">Order ID:</span> ${returnOrder.orderId}
        </p>
        <p><span style="font-weight: 600">Status:</span> Approved</p>
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td
            align="center"
            style="
              padding-top: 32px;
              font-size: 14px;
              color: rgb(107, 114, 128);
            "
          >
            Thank you for choosing AroMagic Perfume ✨
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
        <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
        <p style="margin-top: 8px">
          Need help?
          <a
            href="mailto:support@aromagicperfume.com"
            style="color: rgb(219, 39, 119); text-decoration: underline"
            >support@aromagicperfume.com</a
          >
        </p>
        <p style="margin-top: 16px">© 2025 AroMagic Perfume</p>
        <div style="margin-top: 4px">
          <a href="#" style="text-decoration: underline; margin-right: 8px"
            >Privacy Policy</a
          >
          |
          <a href="#" style="text-decoration: underline; margin-left: 8px"
            >Unsubscribe</a
          >
        </div>
      </div>
    </div>
</body>
</html>
`;
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to : returnOrder.customerId.email,
        cc:process.env.CC_EMAIL,
        subject: `Return / Replacement Request Approved For ${returnOrder.orderId}!`,
        html: htmlContent,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Return/Exchange Approve email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
  
}

const cancelOrderMail = async (order) => {
  const cancelOrder = await Order.findOne({_id :order._id})
      .select('-returnItems')
      .populate("customerId");
       const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
    <div
      style="
        background-color: rgb(255, 255, 255);
        font-family: Arial, sans-serif;
        color: rgb(51, 51, 51);
        width: 100%;
        max-width: 600px;
        margin: 0px auto;
        padding: 24px;
        border-radius: 8px;
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
        style="
          display: none;
          max-height: 0px;
          overflow: hidden;
          visibility: hidden;
        "
      >
        Your email client doesn't support animations. Here's a static version of
        our logo.
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        "
      >
         <a href="https://aromagicperfume.com/" style="text-decoration: none; margin-left: auto; margin-right: auto;"><img src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" style="width: 150px; height: auto;"></a>
      </div>
      <h2
        style="
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
        "
      >
        Order Cancelled Successfully
      </h2>
      <div style="font-size: 14px; line-height: 1.6; margin-bottom: 24px">
        <p>Hi <strong>${cancelOrder.customerId.fullname}</strong>,</p>
        <p>
          Your Order <strong>${cancelOrder.orderId}</strong> has been <strong>Cancelled</strong>.
        </p>
        
      </div>
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
           ${cancelOrder.cartItems
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
                <span style="font-weight: 600">Subtotal:</span> ₹${cancelOrder.subtotal}
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
                <span style="font-weight: 600">Discount:</span> ₹${cancelOrder.totalDiscount}
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
                <span style="font-weight: 600">Coupon Discount:</span> ₹${cancelOrder.couponDiscount}
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
                <span style="font-weight: 600">Shipping:</span> ₹${cancelOrder.shippingCharge}
              </p>
               ${cancelOrder.giftPacking ? `<p
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
                <span style="font-weight: 600">Total:</span> ₹${cancelOrder.finalTotal}
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
        <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
        <p style="margin-top: 8px">
          Need help?
          <a
            href="mailto:support@aromagicperfume.com"
            style="color: rgb(219, 39, 119); text-decoration: underline"
            >support@aromagicperfume.com</a
          >
        </p>
        <p style="margin-top: 16px">© 2025 AroMagic Perfume</p>
        <div style="margin-top: 4px">
          <a href="#" style="text-decoration: underline; margin-right: 8px"
            >Privacy Policy</a
          >
          |
          <a href="#" style="text-decoration: underline; margin-left: 8px"
            >Unsubscribe</a
          >
        </div>
      </div>
    </div>
</body>
</html>
`;
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to : cancelOrder.customerId.email,
        cc:process.env.CC_EMAIL,
        subject: `Your Order ${cancelOrder.orderId} has been Cancelled!`,
        html: htmlContent,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Return/Exchange Approve email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
  
}


