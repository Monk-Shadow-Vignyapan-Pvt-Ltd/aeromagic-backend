import axios from "axios";
import dotenv from "dotenv";
import qs from 'qs';
import FormData from 'form-data';
import { Order } from '../models/order.model.js';
import nodemailer from 'nodemailer'; 

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

const BASE_URL = process.env.BASE_URL;
const PIN_URL = process.env.PINCODE_URL;
//const API_KEY = process.env.DELHIVERY_API_KEY;
const API_KEY = process.env.SELLOSHIP_API_KEY
const WAREHOUSE_ID = process.env.WAREHOUSE_ID;
const PICKUP_PIN = process.env.PICKUP_PIN;

// Check Pincode Serviceability
// export const checkPincode = async (req, res) => {
//     try {
//         const { pincode } = req.params;

//         if (!pincode) {
//             return res.status(400).json({ message: 'Pincode is required', success: false });
//         }

//         const response = await axios.get(
//             `${PIN_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
//             {
//                 headers: { Authorization: `Token ${API_KEY}`,"Content-Type": "application/json", },
//             }
//         );

//         return res.status(200).json({ data: response.data, success: true });
//     } catch (error) {
//         console.error('Error checking pincode:', error);
//         res.status(500).json({ message: 'Failed to check pincode', success: false });
//     }
// };

export const checkPincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!pincode) {
            return res.status(400).json({ message: 'Pincode is required', success: false });
        }

        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = response.data[0];

        if (data.Status !== 'Success' || !data.PostOffice || data.PostOffice.length === 0) {
            return res.status(404).json({ message: 'Invalid or unavailable pincode', success: false });
        }

        // Extracting relevant info
        const uniqueInfo = {
            state: data.PostOffice[0].State,
            district: data.PostOffice[0].District,
            country: data.PostOffice[0].Country,
            postOffices: data.PostOffice.map((po) => ({
                name: po.Name,
                branchType: po.BranchType,
                deliveryStatus: po.DeliveryStatus,
                block: po.Block,
                division: po.Division,
                region: po.Region
            }))
        };

        return res.status(200).json({ data: uniqueInfo, success: true });
    } catch (error) {
        console.error('Error checking pincode:', error.message);
        return res.status(500).json({ message: 'Failed to check pincode', success: false });
    }
};


// Create a Shipment Order
// export const createShipment = async (req, res) => {
//     try {
//       const { shipmentData } = req.body;
  
//       if (!shipmentData) {
//         return res.status(400).json({ message: 'Shipment data is required', success: false });
//       }
  
//       const payload = {
//         format: "json",
//         data: JSON.stringify({
//           shipments: [ shipmentData ],
//           pickup_location: {
//             pin_code: PICKUP_PIN,
//           name: "AROMAGIC WAREHOUSE",
//           phone: "9909407385",
//           add: "AMRELIWALA SHOPPING CENTRE, MATAWAFDI CIRCLE, LH ROAD.",
//           city: "Surat",
//           country: "India",
//           }
//         })
//       };
  
//       const response = await axios.post(
//         `${PIN_URL}/api/cmu/create.json`,
//         qs.stringify(payload), // send as x-www-form-urlencoded
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             "Authorization": `Token ${API_KEY}`,
//             "Accept": "application/json"
//           }
//         }
//       );
  
//       return res.status(201).json({ data: response.data, success: true });
  
//     } catch (error) {
//       console.error("Error creating shipment:", error?.response?.data || error.message);
//       res.status(500).json({ message: "Failed to create shipment", success: false });
//     }
//   };
export const createShipment = async (req, res) => {
  try {
      const { shipmentData } = req.body;

    //   const loginForm = new FormData();
    // loginForm.append("email", process.env.SELLOSHIP_EMAIL);
    // loginForm.append("password", process.env.SELLOSHIP_PASSWORD);

    // const loginResponse = await axios.post(
    //   'https://selloship.com/api/lock_actvs/Vendor_login_from_vendor_all_order',
    //   loginForm,
    //   {
    //     headers: {
    //       Authorization: '9f3017fd5aa17086b98e5305d64c232168052b46c77a3cc16a5067b',
    //       ...loginForm.getHeaders(),
    //     },
    //   }
    // );

    // // console.log(loginResponse);


    // // Optional: You can inspect `loginResponse.data` if you need a token or validation check
    // if (loginResponse.data.success !== "1") {
    //   return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
    // }

    //console.log(loginResponse)
      
      // Prepare FormData for Selloship API
      // const form = new FormData();
      // form.append("vendor_id", loginResponse.data.vendor_id);
      // form.append("device_from", loginResponse.data.device_from);
      // form.append("product_name", shipmentData.products_desc);
      // form.append("price", shipmentData.total_amount);
      // form.append("old_price", shipmentData.total_amount);
      // form.append("first_name", shipmentData.name.split(" ")[0]); // assuming first name is the first part
      // form.append("last_name", shipmentData.name.split(" ")[1] || ""); // assuming second part is the last name
      // form.append("mobile_no", shipmentData.phone);
      // form.append("email", "temp@selloship.com"); // You can replace this with actual email
      // form.append("address", shipmentData.add);
      // form.append("state", shipmentData.state);
      // form.append("city", shipmentData.city);
      // form.append("zip_code", shipmentData.pin);
      // form.append("landmark", ""); // Optional
      // form.append("payment_method", shipmentData.payment_mode === "COD" ? "3" : "1"); // 3 = COD, 1 = Prepaid
      // form.append("qty", shipmentData.quantity);
      // form.append("custom_order_id", shipmentData.order);

      // // Make the POST request to Selloship API
      // const createOrderResponse = await axios.post('https://selloship.com/web_api/Create_order', form, {
      //     headers: {
      //         Authorization: loginResponse.data.access_token,
      //         ...form.getHeaders(),
      //     },
      // });

      // const selloShipOrderId = createOrderResponse.data?.selloship_order_id;

      // if (!selloShipOrderId) {
      //   return res.status(400).json({ success: false, message: 'Failed to create Selloship order', data: createOrderResponse.data });
      // }
  
      // ✅ AWB Generation Step
      // const awbForm = new FormData();
      // awbForm.append("vendor_id", loginResponse.data.vendor_id);
      // awbForm.append("device_from", loginResponse.data.device_from);
      // awbForm.append("order_id", selloShipOrderId);
      // awbForm.append("ship_weight", shipmentData.weight);
      // awbForm.append("pickup_address_id","");
  
      // const awbResponse = await axios.post(
      //   'https://selloship.com/api/lock_actvs/awb_generate',
      //   awbForm,
      //   {
      //     headers: {
      //       Authorization: loginResponse.data.access_token,
      //       ...awbForm.getHeaders(),
      //     },
      //   }
      // );

      const awbPayload = {
        serviceType: "Surface",
        Shipment: {
          code: shipmentData.order,
          orderCode: shipmentData.order,
          weight: shipmentData.weight.toFixed(2), // e.g., "500.00"
          length: shipmentData.shipment_length *10,
          height: shipmentData.shipment_height * 10,
          breadth: shipmentData.shipment_width *10,
          items: [
            {
              name: shipmentData.products_desc,
              skuCode: shipmentData.order || "SKU-DEFAULT",
              description: shipmentData.products_desc,
              quantity: shipmentData.quantity,
              itemPrice: shipmentData.total_amount,
              brand: "",
              color: "",
              category: "",
              size: "",
              item_details: "",
              ean: "",
              imageURL: "",
              hsnCode: "",
              tags: ""
            }
          ]
        },
        deliveryAddressId: "",
        deliveryAddressDetails: {
          name: shipmentData.name,
          email: shipmentData.email || "temp@selloship.com",
          phone: shipmentData.phone,
          address1: shipmentData.add,
          address2: shipmentData.add2 || shipmentData.add,
          pincode: shipmentData.pin,
          city: shipmentData.city,
          state: shipmentData.state,
          country: "India",
          stateCode: shipmentData.stateCode || "",
          countryCode: "IN",
          gstin: "",
          alternatePhone: shipmentData.alternatePhone
        },
        pickupAddressId: "",
        pickupAddressDetails: {
          name: "Aromagic Warehouse",
          email: "support@aromagic.in", // placeholder, replace if needed
          phone: "7069494270",
          address1: "Amreliwala Shopping Center, Matawadi Circle, Lambe Hanuman Rd",
          address2: "Lambe Hanuman Road, Surat",
          pincode: "395006",
          city: "Surat",
          state: "GUJARAT",
          country: "India",
          stateCode: "GJ",
          countryCode: "IN",
          gstin: ""
        },
        returnAddressId: "",
        returnAddressDetails: {
          name: "Aromagic Warehouse",
          email: "support@aromagic.in", // placeholder, replace if needed
          phone: "7069494270",
          address1: "Amreliwala Shopping Center, Matawadi Circle, Lambe Hanuman Rd",
          address2: "Lambe Hanuman Road, Surat",
          pincode: "395006",
          city: "Surat",
          state: "GUJARAT",
          country: "India",
          stateCode: "GJ",
          countryCode: "IN",
          gstin: ""
        },
        currencyCode: "INR",
        paymentMode: shipmentData.payment_mode, // e.g., "COD"
        totalAmount: shipmentData.total_amount.toString(),
        collectableAmount: shipmentData.payment_mode === "COD" ? shipmentData.total_amount.toString() : "0",
        courierName: ""
      };

      //console.log(awbPayload)

      const awbResponse = await axios.post(
        "https://selloship.com/api/lock_actvs/channels/waybill",
        awbPayload,
        {
          headers: {
            Authorization: `token ${process.env.SELLOSHIP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      //console.log(awbResponse)
      
     // const selloShipAWB = awbResponse.data?.awb || awbResponse.data?.AWB; 
  
      if (awbResponse.data?.status === "SUCCESS") {
        const selloShipAWB = awbResponse.data.waybill; // This is the correct AWB number
        const shippingLabel = awbResponse.data.shippingLabel;
        const courierName = awbResponse.data.courierName;
      
        // Continue with the logic for updating the order with the generated AWB
        const updatedOrder = await Order.findOneAndUpdate(
          { orderId: shipmentData.order },
          { selloShipAWB,shippingLabel,courierName, status: 'Processing' },
          { new: true }
        );
      
        return res.status(200).json({
          success: true,
          message: 'Shipment and AWB generated successfully',
          //orderResponse: createOrderResponse.data,
          awbResponse: awbResponse.data,
          updatedOrder,
          shippingLabel,  // Optionally return the shipping label URL
        });
      } else {
        console.error('AWB generation failed:', awbResponse.data);
        return res.status(400).json({ success: false, message: 'Failed to generate AWB', data: awbResponse.data });
      }
  } catch (error) {
      console.error('Selloship order error:', error?.response?.data || error.message);
      res.status(500).json({ success: false, message: 'Selloship order failed', error: error?.response?.data || error.message });
  }
};

export const getOrderShipment = async (req, res) => {
  try {
      const { orderId } = req.body;

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

    // console.log(loginResponse);


    // Optional: You can inspect `loginResponse.data` if you need a token or validation check
    if (loginResponse.data.success !== "1") {
      return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
    }

    //console.log(loginResponse)
      
      // Prepare FormData for Selloship API
      const form = new FormData();
      form.append("vendor_id", loginResponse.data.vendor_id);
      form.append("device_from", loginResponse.data.device_from);
      form.append("order_id", orderId);

      // Make the POST request to Selloship API
      const orderResponse = await axios.post('https://selloship.com/api/lock_actvs/vendor_order_detail', form, {
          headers: {
              Authorization: loginResponse.data.access_token,
              ...form.getHeaders(),
          },
      });

     console.log(orderResponse.data)
  } catch (error) {
      console.error('Selloship order error:', error?.response?.data || error.message);
      res.status(500).json({ success: false, message: 'Selloship order failed', error: error?.response?.data || error.message });
  }
};

  

// Track Shipment Status
export const trackShipment = async (req, res) => {
    try {
        const { trackingId } = req.params;

        if (!trackingId) {
            return res.status(400).json({ message: 'Tracking ID is required', success: false });
        }

        // const response = await axios.get(
        //     `${BASE_URL}/api/v1/packages/json/?waybill=${trackingId}`,
        //     {
        //         headers: { Authorization: `Token ${API_KEY}` },
        //     }
        // );

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

    // console.log(loginResponse);


    // Optional: You can inspect `loginResponse.data` if you need a token or validation check
    if (loginResponse.data.success !== "1") {
      return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
    }

    //console.log(loginResponse)
      
      // Prepare FormData for Selloship API
      const form = new FormData();
      form.append("vendor_id", loginResponse.data.vendor_id);
      form.append("device_from", loginResponse.data.device_from);
      form.append("tracking_id", trackingId);
      form.append("status", 2);

      // Make the POST request to Selloship API
      const trackResponse = await axios.post('https://selloship.com/api/lock_actvs/tracking_detail', form, {
          headers: {
              Authorization: loginResponse.data.access_token,
              ...form.getHeaders(),
          },
      });
      //console.log(trackResponse)

        return res.status(200).json({ data: trackResponse.data, success: true });
    } catch (error) {
        console.error('Error tracking shipment:', error);
        res.status(500).json({ message: 'Failed to track shipment', success: false });
    }
};

// Cancel Shipment
export const cancelShipment = async (req, res) => {
    try {
        const { trackingId,orderId } = req.body;

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

        const trackForm = new FormData();
        trackForm.append("vendor_id", loginResponse.data.vendor_id);
        trackForm.append("device_from", loginResponse.data.device_from);
        trackForm.append("tracking_id", trackingId);

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

      const cancelForm = new FormData();
      cancelForm.append("vendor_id", loginResponse.data.vendor_id);
      cancelForm.append("device_from", loginResponse.data.device_from);
      cancelForm.append("order_id", trackResponse.data.data[0].order_id);
      cancelForm.append("cancel_note","Order Cancel By Customer");

      const cancelResponse = await axios.post(
        'https://selloship.com/api/lock_actvs/Vendor_cancel_order',
        cancelForm,
        {
            headers: {
                Authorization: loginResponse.data.access_token,
                ...cancelForm.getHeaders(),
            },
        }
    );
    if(cancelResponse.data.success === "1"){
      await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });
      await cancelOrderMail();
    }

        return res.status(200).json({ data: cancelResponse.data, success: true });
    } catch (error) {
        console.error('Error canceling shipment:', error);
        res.status(500).json({ message: 'Failed to cancel shipment', success: false });
    }
};


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
