import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    noteName: { type: String, required: true },
    noteType: { type: String, required: true },
    noteImage: { type: String, required: true },
    noteDescription: { type: String, required: true },
    noteUrl:{ type: String, required: true },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const Note = mongoose.model("Note", noteSchema);
