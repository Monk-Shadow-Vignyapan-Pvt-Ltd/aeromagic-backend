import { Store } from '../models/store.model.js';

// Add a new store
export const addStore = async (req, res) => {
    try {
        const { 
            storeTitle,
            storeManager, 
            mapUrl, 
            embedMapUrl,
            storeAddress, 
            storeContactNo, 
            storeImage, 
            multiImages, 
            storeUrl,
            seoTitle,
            seoDescription,
            schema
        } = req.body;

        // Validate required fields
        if (!storeTitle || !mapUrl || !embedMapUrl || !storeImage || !storeUrl) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                success: false 
            });
        }

        // Validate image data if provided
        if (storeImage && !storeImage.startsWith('data:image')) {
            return res.status(400).json({ 
                message: 'Invalid store image data', 
                success: false 
            });
        }

        // Create new store
        const store = new Store({
            storeTitle,
            storeManager,
            mapUrl,
            embedMapUrl,
            storeAddress,
            storeContactNo,
            storeImage,
            multiImages,
            storeUrl,
            seoTitle,
            seoDescription,
            schema
        });

        await store.save();
        res.status(201).json({ store, success: true });
    } catch (error) {
        console.error('Error creating store:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ 
                message: 'Store URL already exists', 
                success: false 
            });
        }
        res.status(500).json({ 
            message: 'Failed to create store', 
            success: false 
        });
    }
};

// Get all stores
export const getStores = async (req, res) => {
    try {
        const stores = await Store.find().sort({ createdAt: -1 });
        if (!stores ) {
            return res.status(404).json({ 
                message: "No stores found", 
                success: false 
            });
        }
        return res.status(200).json({ stores, success: true });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ 
            message: 'Failed to fetch stores', 
            success: false 
        });
    }
};

// Get store by ID
export const getStoreById = async (req, res) => {
    try {
        const storeId = req.params.id;
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ 
                message: "Store not found!", 
                success: false 
            });
        }
        return res.status(200).json({ store, success: true });
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ 
            message: 'Failed to fetch store', 
            success: false 
        });
    }
};

// Get store by URL
export const getStoreByUrl = async (req, res) => {
    try {
        const { id: storeUrl } = req.params;
        
        // Find store by URL (case insensitive)
        const store = await Store.findOne({ storeUrl });
        
        if (!store) {
            return res.status(404).json({ 
                message: "Store not found!", 
                success: false 
            });
        }
    
        
        return res.status(200).json({ 
            store, 
            success: true 
        });
        
    } catch (error) {
        console.error('Error fetching store by URL:', error);
        res.status(500).json({ 
            message: 'Failed to fetch store', 
            success: false,
            error: error.message 
        });
    }
};

// Update store by ID
export const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            storeTitle, 
            storeManager,
            mapUrl, 
            embedMapUrl,
            storeAddress, 
            storeContactNo, 
            storeImage, 
            multiImages, 
            storeUrl,
            seoTitle,
            seoDescription,
            schema
        } = req.body;

        // Validate image data if provided
        if (storeImage && !storeImage.startsWith('data:image')) {
            return res.status(400).json({ 
                message: 'Invalid store image data', 
                success: false 
            });
        }

         const existingStore = await Store.findById(id);
                if (!existingStore) {
                    return res.status(404).json({ message: "Store not found!", success: false });
                }
        
                // Initialize oldUrls array and add the previous serviceUrl if it's different
                let oldUrls = existingStore.oldUrls || [];
                if (existingStore.storeUrl && existingStore.storeUrl !== storeUrl && !oldUrls.includes(existingStore.storeUrl)) {
                    oldUrls.push(existingStore.storeUrl);
                }
        

        const updatedData = {
            storeTitle,
            storeManager,
            mapUrl,
            embedMapUrl,
            storeAddress,
            storeContactNo,
            ...(storeImage && { storeImage }),
            multiImages,
            storeUrl,
            oldUrls,
            seoTitle,
            seoDescription,
            schema
        };

        const store = await Store.findByIdAndUpdate(
            id, 
            updatedData, 
            { new: true, runValidators: true }
        );
        
        if (!store) {
            return res.status(404).json({ 
                message: "Store not found!", 
                success: false 
            });
        }
        
        return res.status(200).json({ store, success: true });
    } catch (error) {
        console.error('Error updating store:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ 
                message: 'Store URL already exists', 
                success: false 
            });
        }
        res.status(400).json({ 
            message: error.message, 
            success: false 
        });
    }
};

// Delete store by ID
export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findByIdAndDelete(id);
        if (!store) {
            return res.status(404).json({ 
                message: "Store not found!", 
                success: false 
            });
        }
        return res.status(200).json({ 
            message: "Store deleted successfully", 
            success: true 
        });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ 
            message: 'Failed to delete store', 
            success: false 
        });
    }
};

// Get store image URL
export const getStoreImageUrl = async (req, res) => {
    try {
        const storeId = req.params.id;
        const store = await Store.findById(storeId).select("storeImage");
        
        if (!store || !store.storeImage) {
            return res.status(404).send('Store image not found');
        }
        
        const matches = store.storeImage.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).send('Invalid image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        res.set('Content-Type', mimeType);
        res.send(buffer);
    } catch (err) {
        console.error('Store image route error:', err);
        res.status(500).send('Error loading store image');
    }
};

// Get stores for frontend (lightweight version)
export const getStoresFrontend = async (req, res) => {
    try {
        const stores = await Store.find()
            .select("storeTitle storeUrl storeAddress storeContactNo")
            .sort({ createdAt: -1 });
            
        if (!stores || stores.length === 0) {
            return res.status(404).json({ 
                message: "No stores found", 
                success: false 
            });
        }
        
        return res.status(200).json({ stores, success: true });
    } catch (error) {
        console.error('Error fetching stores for frontend:', error);
        res.status(500).json({ 
            message: 'Failed to fetch stores', 
            success: false 
        });
    }
};
