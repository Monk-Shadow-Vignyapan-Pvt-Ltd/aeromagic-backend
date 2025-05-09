import axios from "axios";
import dotenv from "dotenv";
import qs from 'qs';
import FormData from 'form-data';
import { Order } from '../models/order.model.js'; 

dotenv.config();

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
    }

        return res.status(200).json({ data: cancelResponse.data, success: true });
    } catch (error) {
        console.error('Error canceling shipment:', error);
        res.status(500).json({ message: 'Failed to cancel shipment', success: false });
    }
};
