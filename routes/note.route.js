import express from "express";
import { addNote, getNotes, getNoteById, deleteNote, updateNote,getNoteNames} from "../controllers/note.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addNote").post( addNote);
router.route("/getNotes").get( getNotes);
router.route("/getNoteById/:id").put( getNoteById);
router.route("/updateNote/:id").post( updateNote);
router.route("/deleteNote/:id").delete(deleteNote);
router.route("/getNoteNames").get( getNoteNames);

export default router;