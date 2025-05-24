import { Contact } from '../models/contact.model.js'; // Adjust path based on your file structure
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'mail.aromagicperfume.com', // Or your SMTP provider
    port: 587,
    secure: false, // true if you use port 465
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendContactEmail = async (contact) => {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: "chirag@monkshadow.com",
        subject: `New Contact Submission - ${contact.subject || 'No Subject'}`,
        html: `
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Phone:</strong> ${contact.phone}</p>
            <p><strong>Message:</strong> ${contact.message}</p>

        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


// Add a new contact
export const addContact = async (req, res) => {
    try {
        const { name, phone, email, subject, message, isContactClose,userId ,followups} = req.body;

        // Validate required fields
        if (!name || !phone || !email || !message) {
            return res.status(400).json({ 
                message: 'Please provide all required fields', 
                success: false 
            });
        }

        // Check if a contact with the same email or phone already exists
        const existingContact = await Contact.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingContact) {
            // Update the existing contact
            existingContact.name = name;
            existingContact.phone = phone;
            existingContact.email = email;
            existingContact.subject = subject;
            existingContact.message = message;
            existingContact.isContactClose = isContactClose;
            existingContact.userId = userId;
            existingContact.followups = followups;
            // Save the updated contact
            await existingContact.save();
         //   await sendContactEmail(existingContact);

            return res.status(200).json({ 
                message: 'Contact updated successfully', 
                contact: existingContact, 
                success: true 
            });
        }

        // Create a new contact document if no existing contact is found
        const newContact = new Contact({
            name,
            phone,
            email,
            subject,
            message,
            isContactClose,
            userId,
            followups
        });

        // Save the new contact to the database
        await newContact.save();
        await sendContactEmail(newContact);

        res.status(201).json({ 
            message: 'Contact added successfully', 
            contact: newContact, 
            success: true 
        });
    } catch (error) {
        console.error('Error adding/updating contact:', error);
        res.status(500).json({ 
            message: 'Failed to process the request', 
            success: false 
        });
    }
};


// Get all contacts
export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        if (!contacts ) {
            return res.status(404).json({ message: "No contacts found", success: false });
        }
        return res.status(200).json({ contacts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch contacts', success: false });
    }
};

export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, subject, message, isContactClose ,userId,followups} = req.body;

        const updatedData = {name, phone, email, subject, message, isContactClose,userId,followups};

        const contact = await Contact.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!contact) return res.status(404).json({ message: "Contact not found!", success: false });
        return res.status(200).json({ contact, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};
