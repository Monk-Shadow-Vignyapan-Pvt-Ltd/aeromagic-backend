import mongoose from "mongoose";

const offerBannerSchema = new mongoose.Schema({
    offerBannerImage: {
        type: String, // Store image as base64 or use a URL reference
        required: true,
      },
      mobileImage: {
        type: String, // Store image as base64 or use a URL reference
        required: false,
      },
    rank:{
      type: String, // Store image as base64 or use a URL reference
      required: true,    
    },
    bannerUrl:{
        type: String, // Store image as base64 or use a URL reference
        required: false,
      },
    offerEnabled:{
        type: Boolean, // Store image as base64 or use a URL reference
        required: true,    
      },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const OfferBanner = mongoose.model("OfferBanner", offerBannerSchema);
