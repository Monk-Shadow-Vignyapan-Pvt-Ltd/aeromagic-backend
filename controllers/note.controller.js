import { Note } from '../models/note.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';

// Add a new note
export const addNote = async (req, res) => {
    try {
        const { noteName, noteType, noteImage, noteDescription, noteUrl, userId } = req.body;

        // Validate base64 image data
        if (!noteImage || !noteImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the image using sharp
        let compressedBase64 = "";
        if (noteImage) {
            const base64Data = noteImage.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();

            compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        }

        // Create and save the note in MongoDB
        const note = new Note({
            noteName,
            noteType,
            noteImage: noteImage ? compressedBase64 : noteImage,
            noteDescription,
            noteUrl,
            userId,
        });

        await note.save();
        res.status(201).json({ note, success: true });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ message: 'Failed to add note', success: false });
    }
};

// Get all notes
export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find();
        if (!notes) return res.status(404).json({ message: "Notes not found", success: false });
        return res.status(200).json({ notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Failed to fetch notes', success: false });
    }
};

// Get note by ID
export const getNoteById = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ message: "Note not found!", success: false });
        return res.status(200).json({ note, success: true });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ message: 'Failed to fetch note', success: false });
    }
};

// Update note by ID
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { noteName, noteType, noteImage, noteDescription, noteUrl, userId } = req.body;

        // Validate base64 image data if provided
        if (!noteImage || !noteImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the image using sharp
        let compressedBase64 = "";
        if (noteImage) {
            const base64Data = noteImage.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();

            compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        }

        const updatedData = {
            noteName,
            noteType,
            noteImage: noteImage ? compressedBase64 : noteImage,
            noteDescription,
            noteUrl,
            userId,
        };

        const note = await Note.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!note) return res.status(404).json({ message: "Note not found!", success: false });
        return res.status(200).json({ note, success: true });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete note by ID
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByIdAndDelete(id);
        if (!note) return res.status(404).json({ message: "Note not found!", success: false });
        return res.status(200).json({ note, success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Failed to delete note', success: false });
    }
};
