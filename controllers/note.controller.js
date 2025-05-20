import { Note } from '../models/note.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';

// Add a new note
export const addNote = async (req, res) => {
    try {
        const { noteName, noteDescription, userId } = req.body;

      
        const note = new Note({
            noteName,
            noteDescription,
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
        const { noteName, noteDescription, userId } = req.body;

        const updatedData = {
            noteName,
            noteDescription,
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

export const getNoteNames = async (req, res) => {
    try {
        const notes = await Note.find().select("noteName");
        if (!notes) return res.status(404).json({ message: "Notes not found", success: false });
        return res.status(200).json({ notes });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch notes', success: false });
    }
};

