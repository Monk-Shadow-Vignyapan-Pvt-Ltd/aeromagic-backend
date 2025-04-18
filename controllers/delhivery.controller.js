import axios from "axios";
import dotenv from "dotenv";
import qs from 'qs';

dotenv.config();

const BASE_URL = process.env.BASE_URL;
const PIN_URL = process.env.PINCODE_URL;
const API_KEY = process.env.DELHIVERY_API_KEY;
const WAREHOUSE_ID = process.env.WAREHOUSE_ID;
const PICKUP_PIN = process.env.PICKUP_PIN;

// Check Pincode Serviceability
export const checkPincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!pincode) {
            return res.status(400).json({ message: 'Pincode is required', success: false });
        }

        const response = await axios.get(
            `${PIN_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
            {
                headers: { Authorization: `Token ${API_KEY}`,"Content-Type": "application/json", },
            }
        );

        return res.status(200).json({ data: response.data, success: true });
    } catch (error) {
        console.error('Error checking pincode:', error);
        res.status(500).json({ message: 'Failed to check pincode', success: false });
    }
};

// Create a Shipment Order
export const createShipment = async (req, res) => {
    try {
      const { shipmentData } = req.body;
  
      if (!shipmentData) {
        return res.status(400).json({ message: 'Shipment data is required', success: false });
      }
  
      const payload = {
        format: "json",
        data: JSON.stringify({
          shipments: [ shipmentData ],
          pickup_location: {
            pin_code: PICKUP_PIN,
          name: "AROMAGIC WAREHOUSE",
          phone: "9909407385",
          add: "AMRELIWALA SHOPPING CENTRE, MATAWAFDI CIRCLE, LH ROAD.",
          city: "Surat",
          country: "India",
          }
        })
      };
  
      const response = await axios.post(
        `${PIN_URL}/api/cmu/create.json`,
        qs.stringify(payload), // send as x-www-form-urlencoded
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Token ${API_KEY}`,
            "Accept": "application/json"
          }
        }
      );
  
      return res.status(201).json({ data: response.data, success: true });
  
    } catch (error) {
      console.error("Error creating shipment:", error?.response?.data || error.message);
      res.status(500).json({ message: "Failed to create shipment", success: false });
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
