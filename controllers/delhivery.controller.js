import axios from "axios";
import dotenv from "dotenv";
import qs from 'qs';
import FormData from 'form-data';

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
      
      // Prepare FormData for Selloship API
      const form = new FormData();
      form.append("vendor_id", "16793");
      form.append("device_from", "4");
      form.append("product_name", shipmentData.products_desc);
      form.append("price", shipmentData.total_amount);
      form.append("old_price", shipmentData.total_amount);
      form.append("first_name", shipmentData.name.split(" ")[0]); // assuming first name is the first part
      form.append("last_name", shipmentData.name.split(" ")[1] || ""); // assuming second part is the last name
      form.append("mobile_no", shipmentData.phone);
      form.append("email", "temp@selloship.com"); // You can replace this with actual email
      form.append("address", shipmentData.add);
      form.append("state", shipmentData.state);
      form.append("city", shipmentData.city);
      form.append("zip_code", shipmentData.pin);
      form.append("landmark", ""); // Optional
      form.append("payment_method", shipmentData.payment_mode === "COD" ? "3" : "1"); // 3 = COD, 1 = Prepaid
      form.append("qty", shipmentData.quantity);
      form.append("custom_order_id", shipmentData.order);

      // Make the POST request to Selloship API
      const response = await axios.post('https://selloship.com/web_api/Create_order', form, {
          headers: {
              Authorization: API_KEY,
              ...form.getHeaders(),
          },
      });

      res.status(200).json({ success: true, data: response.data });
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

        const response = await axios.get(
            `${BASE_URL}/api/v1/packages/json/?waybill=${trackingId}`,
            {
                headers: { Authorization: `Token ${API_KEY}` },
            }
        );

        return res.status(200).json({ data: response.data, success: true });
    } catch (error) {
        console.error('Error tracking shipment:', error);
        res.status(500).json({ message: 'Failed to track shipment', success: false });
    }
};

// Cancel Shipment
export const cancelShipment = async (req, res) => {
    try {
        const { trackingId } = req.params;

        if (!trackingId) {
            return res.status(400).json({ message: 'Tracking ID is required', success: false });
        }

        const response = await axios.post(
            `${BASE_URL}/api/p/edit`,
            { waybill: trackingId, cancel_reason: "Customer request" },
            {
                headers: { Authorization: `Token ${API_KEY}` },
            }
        );

        return res.status(200).json({ data: response.data, success: true });
    } catch (error) {
        console.error('Error canceling shipment:', error);
        res.status(500).json({ message: 'Failed to cancel shipment', success: false });
    }
};
