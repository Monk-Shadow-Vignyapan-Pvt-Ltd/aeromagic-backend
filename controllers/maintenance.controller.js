import { Maintenance } from "../models/maintenance.model.js";

export const maintenanceOnOff = async (req, res) => {
    try {
        const { maintenanceEnabled } = req.body;
    
        if (typeof maintenanceEnabled !== "boolean") {
          return res.status(400).json({ message: "Invalid value for maintenanceEnabled." });
        }
    
        // Use findOneAndUpdate to update or create the document, ensuring only one exists
        const maintenanceStatus = await Maintenance.findOneAndUpdate(
          {}, // Empty filter ensures it checks the entire collection
          { maintenanceEnabled }, // Set the new surveyEnabled value
          { new: true, upsert: true } // Create the document if it doesn't exist
        );
    
        res.status(200).json({
          message: "Maintenance status updated successfully.",
          data: maintenanceStatus,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
      }
}

export const getMaintenanceOnOff = async (req, res) => {
  try {
      const maintenanceonoffs = await Maintenance.find();
      if (!maintenanceonoffs) return res.status(404).json({ message: "Maintenance not found", success: false });
      return res.status(200).json({ maintenanceonoffs });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed to fetch maintenance', success: false });
  }
};