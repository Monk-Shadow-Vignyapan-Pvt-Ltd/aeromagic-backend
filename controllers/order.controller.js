import { Order } from '../models/order.model.js'; // Adjust the path as necessary
import { Product } from '../models/product.model.js'; 
import moment from 'moment';
import { Customer } from '../models/customer.model.js';
import nodemailer from 'nodemailer';
import axios from "axios";
import dotenv from "dotenv";
import FormData from 'form-data';

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

const sendOrderConfirmationEmail = async (to, orderId, customerName, cartItems) => {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to,
        subject: `Your Order ${orderId} has been placed!`,
        html: `
        <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
            }
          }
          @keyframes flap-left {
            0% { transform: rotate(-10deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes flap-right {
            0% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
          }
          .left-wing {
            animation: flap-left 1s infinite alternate ease-in-out;
            transform-origin: 40% 50%;
          }
          .right-wing {
            animation: flap-right 1s infinite alternate ease-in-out;
            transform-origin: 60% 60%;
          }
          .no-animation .left-wing,
          .no-animation .right-wing {
            animation: none !important;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: #ffffff; color: #1f2937; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">


            {/* Embedded CSS with animations and fallbacks */}
            

            {/* Fallback for non-animation supporting clients */}
            <div class="no-animation" style={{
                display: "none",
                maxHeight: "0",
                overflow: "hidden",
                visibility: "hidden"
            }}>
                Your email client doesn't support animations. Here's a static version of our logo.
            </div>

            {/* Header / Logo */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "32px"
            }}>
                <a href='https://aromagicperfume.com/' aria-label='logo-brand' style={{
                    textDecoration: "none"
                }}>
                    <svg
                        id="AroMagicLogo"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        viewBox="0 0 766 270"
                        style={{
                            width: "150px",
                            height: "auto"
                        }}
                    >
                        <defs>
                            <style
                                dangerouslySetInnerHTML={{
                                    __html: ".cls-1 { fill: #000; stroke-width: 0px; }"
                                }}
                            />
                        </defs>
                        <path
                            id="text"
                            className="cls-1 main-text"
                            d="M495.6,258.2c0,2.3,0,4.6,0,6.9,0,1.1-.4,1.5-1.5,1.5-6.7,0-13.4-.1-20-.1-1.4,0-1.7-.9-2.1-1.8-5.7-11.7-11.4-23.4-16.9-35.1-1-2-2.1-2.7-4.3-2.6-5.4,0-10.8,0-16.2,0-1.3,0-1.9-.4-2.4-1.6-2-4.8-4.1-9.5-6.3-14.6h20.1c-8.2-16.9-16.2-33.5-24.5-50.6-1.8,3.9-3.4,7.4-5,10.8-3.6,7.8-7.2,15.7-10.8,23.6-.4.8-.4,2,0,2.8,7.8,16.7,15.7,33.3,23.5,50,.5,1.1,1.1,1.5,2.3,1.5,3.9,0,7.8,0,11.9,0,0,1.8.3,3.4.3,5,0,3.7,0,7.3,0,11,0,1.3-.4,1.8-1.8,1.8-6.3,0-12.6-.1-18.9,0-1.5,0-2.2-.6-2.9-1.9-8.1-15.4-16.2-30.7-24.3-46-.3-.6-.6-1.1-1-1.9-.4.7-.7,1.2-1,1.8-8.1,15.4-16.2,30.7-24.2,46.1-.8,1.5-1.7,2.1-3.4,2.1-6-.1-11.9,0-17.9-.1-.7,0-1.4-.1-2.2-.2v-17.5c2.4,0,4.7,0,7.1,0,2.2,0,4.9.6,6.5-.4,1.6-1,2.1-3.7,3-5.6,7.1-15,14.1-30,21.3-44.9.6-1.3.7-2.4,0-3.7-5-10.7-10-21.4-15-32.2-.2-.4-.4-.8-.7-1.5-.4.6-.7,1.1-.9,1.5-16.4,33.9-32.8,67.8-49.1,101.8-1,2.2-2.2,2.9-4.6,2.9-5.7-.2-11.4-.1-17.1-.2-.7,0-1.4,0-2.2-.2v-17.5c3.4,0,6.8,0,10.2,0,1.4,0,2.1-.4,2.7-1.7,18.1-37.8,36.3-75.6,54.4-113.5.7-1.5,1.5-2.2,3.3-2.1,2.3.2,4.6.1,6.9,0,1.3,0,2,.4,2.6,1.6,4.9,10.7,10,21.3,15,32,1.7,3.6,3.4,7.3,5.2,11.2.4-.7.7-1.1.9-1.6,6.5-13.8,12.9-27.6,19.3-41.4.7-1.4,1.4-2,3-1.9,2.4.1,4.8.1,7.1,0,1.3,0,2,.4,2.6,1.6,4.9,10.3,9.9,20.6,14.9,30.9,13.3,27.8,26.7,55.6,40,83.4.5.9.9,1.3,2,1.3,3.5,0,7,0,10.9,0v9.4h0ZM604.6,220.6h-40v12.3h23.1c0,4.9,0,9.6,0,14.3,0,.6-.6,1.3-1.1,1.7-7.5,5.1-15.6,8.2-24.7,8.3-14.3.1-25-7.5-29-21.1-2.9-9.6-2.9-19.5,0-29.2,2.3-8.1,7.5-14,15.4-17.4,5.1-2.2,10.5-2.7,16-2.5,9.7.5,17,4.6,21.4,13.5.5,1,1.1,1.3,2.1,1.1,1.5-.2,3-.5,4.5-.8,3.5-.6,7-1.3,10.6-1.9-.1-.5-.1-.7-.2-1-3.6-10.9-11-18-21.9-21.3-9.7-3-19.7-3.1-29.7-1.6-12.3,1.9-22.3,7.9-29.2,18.3-8.6,13.1-9.9,27.5-6.2,42.4,3.6,14.9,12.4,25.5,27.1,30.8,12.4,4.4,25.1,4.4,37.8,1.1,8-2.1,15.6-5.2,22.4-10.1,1.4-1,2-2,2-3.8-.1-9,0-18.1,0-27.1v-6h0ZM180.6,268c-.8.1-1.3.3-1.7.3-4.8,0-9.6,0-14.4,0-1.3,0-1.9-.5-2.6-1.5-6.3-9.7-12.6-19.3-18.9-29-.8-1.3-1.8-2.5-2.8-3.6-3.1-3.7-7.2-5.7-12-5.9-2.9,0-5.8-.2-8.7-.3-.6,0-1.2,0-2,.1v2.4c0,11.9,0,23.7,0,35.6,0,1.7-.4,2.2-2.2,2.2-3.7-.1-7.3-.1-11,0-1.3,0-1.8-.4-1.8-1.7,0-29.7,0-59.4,0-89.1,0-.4,0-.9.2-1.5h2.1c12.1,0,24.3-.2,36.4,0,5.3,0,10.6.6,15.9,1.4,8,1.3,13.2,6.3,15.8,13.8,3.2,9.1,2.6,17.9-3.5,25.8-3.2,4.2-7.8,6.4-12.7,7.9-2,.6-4,1.2-6.5,1.9,13.9,11.1,21.1,26.7,30.3,41.2h0ZM151,215.1c6.5-2.1,9-8.6,8.1-15.2-.9-6.8-5.6-11-12.3-11.2-6.5-.2-12.9-.3-19.4-.4-3.3,0-6.5,0-9.9,0v28.2c.4,0,.7.1,1,.1,7.5,0,15,.2,22.5,0,3.4,0,6.8-.4,10-1.4h0ZM277.1,206.5c1.1,5.1,1.4,10.4,2.1,15.5-.4,9-1.6,17.7-5.7,25.8-5.9,11.8-15.4,18.9-28.4,21.2-8.8,1.6-17.5,1.2-25.9-1.8-12.2-4.4-20.2-13.2-24-25.4-4.2-13.8-4.3-27.8.7-41.3,5.5-15,16.3-24.2,32.7-25.9,9.5-1,18.8-.4,27.5,4,11.5,5.9,18.2,15.5,20.9,27.9h0ZM263.6,221.7c-.4-3.7-.5-7.4-1.1-11.1-2.4-14.5-12.6-24.1-27.8-23.7-11.7.3-20.6,7.6-23.6,16.5-1.4,4-2.2,8.2-2.8,12.4-1,7.8-.4,15.6,2.2,23.1,3.9,11.2,13.3,18,25,18.1,11.6.2,20.9-6.2,25.1-17.3,2.2-5.8,2.9-11.9,3-18.1h0ZM86.4,264.9c.4.9.7,1.9,1.2,3.2-5.3,0-10.2,0-15.2,0-.5,0-1.1-.9-1.3-1.5-2.3-6.1-4.6-12.2-6.8-18.3-.5-1.4-1.1-2-2.7-1.9-12.1,0-24.1,0-36.2,0-1.5,0-2.1.5-2.6,1.9-2.1,6-4.2,12.1-6.3,18.1-.5,1.5-1.2,2.1-2.9,2-4.4-.1-8.8,0-13.6,0,1.8-4.7,3.3-9,4.9-13.3,9.6-25.5,19.2-51,28.7-76.6.7-1.9,1.6-2.7,3.7-2.6,4.1.2,8.2.1,12.3,0,1.6,0,2.4.5,2.9,2,6.1,15.9,12.3,31.8,18.5,47.7,5.1,13.2,10.2,26.3,15.3,39.5h0ZM58.8,233.7c-5.2-14.3-10.4-28.4-15.6-42.6-.1,0-.3,0-.4.1-5,14.1-9.9,28.1-15,42.4h31,0ZM731,237.6c-.2.6-.4,1.2-.6,1.8-1.8,5-4.4,9.5-8.7,12.9-11.3,8.9-33.6,6-39.2-13.4-2.9-9.9-2.9-20-1.1-30,2.7-14.8,13.9-22.8,27.9-21.9,9.7.6,16.6,5,20.4,14,.5,1.2,1,1.6,2.3,1.2,1.5-.4,3-.6,4.5-1,3.4-.8,6.7-1.6,10.1-2.4-3.2-9.8-9.2-16.7-18.3-20.8-9.6-4.3-19.6-4.8-29.7-3-14.2,2.5-24.8,10.2-30.8,23.4-5.5,12.2-6,25.2-3.2,38.2,3.2,14.7,11.9,24.9,25.9,30.3,8.3,3.2,17.1,3.6,25.9,2.2,9.1-1.5,17-5.2,22.9-12.5,3.6-4.3,6.1-9.2,7.6-14.9-5.3-1.5-10.5-3-15.5-4.5-.3.3-.4.3-.4.3h0ZM643.1,176h-16.3v92.3h13.7c2.9,0,2.9,0,2.9-2.8,0-27.8,0-55.5,0-83.3,0-2-.2-4.1-.3-6.2ZM765.2,158.7c0,8.3-6.8,15.1-15,15.1s-15.1-6.9-15.1-15.1,6.8-15,15.3-15c8.3,0,14.8,6.7,14.8,14.9h0ZM763.1,159.1c0-7.6-5.5-13.3-12.8-13.4-7.3,0-13.2,5.7-13.2,12.9,0,7,5.9,13.1,13,13.2,6.9.1,13-5.8,13-12.7h0ZM761.3,154.9c0-.8.5-2.1-1.2-2.1-1.3,0-2.7-.4-3.1,1.6-.3,1.7-.9,3.3-1.5,5.4-.3-.9-.4-1.2-.5-1.6-.3-.9-.5-1.8-.8-2.8-.8-2.9-1.4-3.2-4.3-2.2v11.3h2.4v-6c.1,0,.2,0,.4,0,.4,1.6.9,3.1,1.2,4.7.2,1,.6,1.8,1.7,1.5.6-.2,1.4-.8,1.6-1.4.6-1.6.9-3.3,1.3-4.9.2,1.6.2,3.2.2,4.8s.2,1.6,1.4,1.6,1.4-.6,1.4-1.6c0-2.8,0-5.5,0-8.3h0ZM739.3,155c1,0,2,.1,3.3.2v9.4h2.6v-9.5c1.2,0,2.3-.1,3.4-.2,0-.8,0-1.3-.1-2.1h-9.1v2.1Z"
                        />
                        <g id="left-wing" className="left-wing">
                            <path
                                className="cls-1"
                                d="M273.2,82.2c-7.6-5.1-15.2-10.2-22.5-15.8-12.2-9.2-18.5-22-21.3-36.7-1.8-9.3-1.7-18.6.7-27.8.2-.5.3-1.1.6-2,.7,2.7,1.3,5.1,2,7.3,9.2,29.9,27.7,52.1,55.6,66.5,7.1,3.7,13.6,8.3,18.1,15.2,4.7,7.2,5.6,15.1,4.9,23.4-.8,9.4-2,18.7-2.4,28.1-.4,9.9,2.7,18.9,8.3,27,.2.4.5.7.8,1.1,0,0,0,.2.2.7-.9-.4-1.5-.6-2.2-1-4.9-2.7-8.6-6.6-11.6-11.3-5.4-8.6-8.9-17.9-9.2-28.1-.2-6.5,0-13.1.4-19.6.3-5.2-1-9.6-4.5-13.4-5.2-5.6-11.7-9.6-17.9-13.8Z"
                            />
                            <path
                                className="cls-1"
                                d="M243.9,91.8c-6.2-3.4-12.4-7.1-17.6-12-9.8-9.2-15.5-20.7-18.2-33.8-1.5-7.3-1.7-14.7.1-22.3.3.4.5.7.6,1,10,24.2,26.8,42.3,49.7,54.9,8.3,4.5,16.9,8.6,24.5,14.4,1.3,1,2.6,2.1,3.8,3.2,4.1,3.8,6.2,8.3,4.2,14.1-5.7-2.2-11.4-4.5-17.1-6.7-10.2-3.9-20.5-7.5-30.2-12.8Z"
                            />
                            <path
                                className="cls-1"
                                d="M271.6,125.9c-7.8-.9-15.4-2.5-22.7-5.1h0c-12.9-4.6-24.1-11.5-31.9-23.2-4.4-6.7-7.3-13.9-8.4-21.8-.1-.9,0-1.9.4-3.2.3.5.6,1,1,1.5,7.9,10.3,18.3,17.3,29.8,22.8,12.7,6.1,26.1,10.3,39.5,14.7,3.5,1.1,7.1,2.2,10.6,3.3,1.1.3,1.3.8,1.3,1.9-.1,2.9,0,5.7,0,8.7-6.7,1.2-13.1,1.3-19.6.6Z"
                            />
                            <path
                                className="cls-1"
                                d="M259.7,145.1c-13.3.4-24-4.9-33.1-14h0c-4.6-4.6-8.1-9.9-10.5-15.9-.2-.6-.4-1.2-.7-2.1,23,17.7,48.4,21,75.6,14.6.7,4.4,1.3,8.4,2,12.6-3.8.7-7.5,1.5-11.2,2.2-7.3,1.3-14.6,2.4-22.1,2.6Z"
                            />
                            <path
                                className="cls-1"
                                d="M266.9,161.4c-4.4.2-8.6-.7-12.8-2.1h0c-8-2.6-14.7-7.1-19.6-14.1-.2-.2-.3-.5-.6-1,20.2,8.4,39.9,5.1,59.5-.9,1.3,2.9,2.5,5.6,3.8,8.7-4.1,1.7-8.1,3.4-12.2,5-5.9,2.3-11.8,4.2-18.1,4.5Z"
                            />
                            <path
                                className="cls-1"
                                d="M298.3,155.2c3.4,4.4,6.7,8.7,10.2,13.2h0c-2.1.5-4.4,1.2-6.7,1.6-6.3,1.1-12.6,2.1-19.1,1.6-6.3-.5-13.3-1.7-18-6.8,12.7.9,23.4-4.1,33.6-9.7Z"
                            />
                        </g>
                        <g id="right-wing" className="right-wing">
                            <path
                                className="cls-1"
                                d="M517.1,82.2c7.6-5.1,15.2-10.2,22.5-15.8,12.2-9.2,18.5-22,21.3-36.7,1.8-9.3,1.7-18.6-.7-27.8-.1-.5-.3-1.1-.6-2-.7,2.7-1.3,5.1-2,7.3-9.2,29.9-27.7,52.1-55.6,66.5-7.1,3.7-13.6,8.3-18.1,15.2-4.7,7.2-5.6,15.1-4.9,23.4.8,9.4,2,18.7,2.4,28.1.4,9.9-2.7,18.9-8.3,27-.2.4-.5.7-.8,1.1,0,0,0,.2-.2.7.9-.4,1.5-.6,2.1-1,4.9-2.7,8.6-6.6,11.6-11.3,5.4-8.6,8.9-17.9,9.2-28.1.2-6.5,0-13.1-.4-19.6-.3-5.2,1-9.6,4.5-13.4,5.2-5.6,11.7-9.6,17.9-13.8Z"
                            />
                            <path
                                className="cls-1"
                                d="M546.3,91.8c6.2-3.4,12.3-7.1,17.6-12,9.8-9.2,15.5-20.7,18.2-33.8,1.5-7.3,1.7-14.7-.1-22.3-.3.4-.5.7-.6,1-10,24.2-26.8,42.3-49.7,54.9-8.3,4.5-16.9,8.6-24.5,14.4-1.3,1-2.6,2.1-3.8,3.2-4.1,3.8-6.2,8.3-4.2,14.1,5.7-2.2,11.4-4.5,17.1-6.7,10.2-3.9,20.5-7.5,30.2-12.8Z"
                            />
                            <path
                                className="cls-1"
                                d="M518.6,125.9c7.8-.9,15.4-2.5,22.7-5.1h0c12.9-4.6,24.1-11.5,31.9-23.2,4.4-6.7,7.3-13.9,8.4-21.8.1-.9,0-1.9-.4-3.2-.3.5-.7,1-1,1.5-7.9,10.3-18.3,17.3-29.8,22.8-12.7,6.1-26.1,10.3-39.5,14.7-3.5,1.1-7.1,2.2-10.6,3.3-1.1.3-1.3.8-1.3,1.9.1,2.9,0,5.7,0,8.7,6.7,1.2,13.1,1.3,19.6.6Z"
                            />
                            <path
                                className="cls-1"
                                d="M530.6,145.1c13.3.4,24-4.9,33.1-14h0c4.6-4.6,8.1-9.9,10.5-15.9.2-.6.4-1.2.7-2.1-23,17.7-48.4,21-75.6,14.6-.7,4.4-1.4,8.4-2,12.6,3.8.7,7.5,1.5,11.2,2.2,7.3,1.3,14.6,2.4,22.1,2.6Z"
                            />
                            <path
                                className="cls-1"
                                d="M523.4,161.4c4.4.2,8.6-.7,12.8-2.1h0c8-2.6,14.7-7.1,19.6-14.1.2-.2.3-.5.6-1-20.2,8.4-39.9,5.1-59.5-.9-1.3,2.9-2.5,5.6-3.8,8.7,4.1,1.7,8.1,3.4,12.2,5,5.8,2.3,11.8,4.2,18.1,4.5Z"
                            />
                            <path
                                className="cls-1"
                                d="M491.9,155.2c-3.4,4.4-6.7,8.7-10.2,13.2h0c2.1.5,4.4,1.2,6.7,1.6,6.3,1.1,12.6,2.1,19,1.6,6.3-.5,13.3-1.7,18-6.8-12.7.9-23.4-4.1-33.6-9.7Z"
                            />
                        </g>
                    </svg>
                </a>
            </div>

            {/* Title */}
            <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "24px",
                textAlign: "center"
            }}>
                🛍️ Thank You for Your Order!
            </h2>

            {/* Customer Details */}
            <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                <tr>
                    <td style={{ paddingBottom: "24px" }}>
                        <p style={{ margin: "0 0 8px 0" }}>Hello <strong>{order.customerName}</strong>,</p>
                        <p style={{ margin: "0" }}>We've received your order <strong>#{order.orderId}</strong> and it's being processed. Below are the details:</p>
                    </td>
                </tr>
            </table>

            {/* Order Summary */}
            <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "24px"
            }}>
                <tr>
                    <td style={{ padding: "16px" }}>
                        <h3 style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            margin: "0 0 8px 0"
                        }}>Order Summary</h3>

                        {/* Products Table */}
                        <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                            <thead>
                                <tr>
                                    <th align="left" style={{
                                        padding: "8px 0",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>Product</th>
                                    <th align="left" style={{
                                        padding: "8px 0",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>Quantity</th>
                                    <th align="right" style={{
                                        padding: "8px 0",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {${cartItems}.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{
                                            padding: "8px 0",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}>{item.name}</td>
                                        <td style={{
                                            padding: "8px 0",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}>{item.quantity}</td>
                                        <td align="right" style={{
                                            padding: "8px 0",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}>₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{
                            marginTop: "16px"
                        }}>
                            <tr>
                                <td align="right">
                                    <p style={{ margin: "8px 0", fontSize: "16px", width: "100%", maxWidth: "180px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: "600" }}>Subtotal:</span> ₹{order.subtotal}</p>
                                    <p style={{ margin: "8px 0", fontSize: "16px", width: "100%", maxWidth: "180px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: "600" }}>Shipping:</span> ₹{order.shipping}</p>
                                    <p style={{ margin: "8px 0", fontSize: "16px", fontWeight: "600", width: "100%", maxWidth: "180px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: "600" }}>Total:</span> ₹{order.total}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            

            {/* Footer */}
            <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                <tr>
                    <td align="center" style={{
                        paddingTop: "32px",
                        fontSize: "14px",
                        color: "#6b7280"
                    }}>
                        Thank you for shopping with AroMagic Perfume ✨ <br />
                    </td>
                </tr>
            </table>

            {/* Footer */}
            <div style={{
                marginTop: "40px",
                textAlign: "center",
                fontSize: "14px",
                color: "#6b7280"
            }}>
                <p>Follow us: Instagram | Facebook | Twitter</p>
                <p style={{ marginTop: "8px" }}>Need help? <a href="mailto:support@aromagicperfume.com" style={{ color: "#db2777", textDecoration: "underline" }}>support@aromagicperfume.com</a></p>
                <p style={{ marginTop: "16px" }}>&copy; 2025 AroMagic Perfume</p>
                <div style={{ marginTop: "4px" }}>
                    <a href="#" style={{ textDecoration: "underline", marginRight: "8px" }}>Privacy Policy</a> | <a href="#" style={{ textDecoration: "underline", marginLeft: "8px" }}>Unsubscribe</a>
                </div>
            </div>
        </div>
        </body>
      </html>
      `,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Add a new order
export const addOrder = async (req, res) => {
    try {
        const { customerId, orderType, cartItems, status, shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage } = req.body;

        const now = new Date();
        const formattedDate = moment(now).format('DD-MM-YYYY');
        const prefix = 'AM';

        // Count how many orders exist for today
        const dateStart = moment().startOf('day').toDate();
        const dateEnd = moment().endOf('day').toDate();

        const todayOrders = await Order.find({
            createdAt: { $gte: dateStart, $lte: dateEnd },
            orderId: { $regex: `^${prefix}-${formattedDate}-` }
        });

        const orderNumber = String(todayOrders.length + 1).padStart(4, '0');
        const orderId = `${prefix}-${formattedDate}-${orderNumber}`;

        const order = new Order({
            customerId,
            orderType,
            cartItems,
            status,
            orderId,
            shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage
        });

        await order.save();
        const customer = await Customer.findById(customerId);
        if (customer?.email) {
          await sendOrderConfirmationEmail(customer.email, orderId, shippingAddress.fullName || 'Customer',cartItems);
        }

        res.status(201).json({ order, success: true });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Failed to add order', success: false });
    }
};

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const { status = "All", startDate, endDate, page = 1, limit = 12, search = "" } = req.query;

        const filter = {};

        // Filter by status
        if (status !== "All") {
            filter.status = status;
        }

        // Filter by date range
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Search filter (case-insensitive)
        // if (search.trim() !== "") {
        //     const regex = new RegExp(search, "i");
        //     filter.$or = [
        //         { orderId: regex },
        //         { "cartItems.productName": regex }, // assumes `productName` in `cartItems`
        //     ];
        // }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalOrders = await Order.countDocuments(filter);
        // Fetch orders
        const orders = await Order.find(filter)
            .populate("customerId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Login to Selloship once
        const loginForm = new FormData();
        loginForm.append("email", process.env.SELLOSHIP_EMAIL);
        loginForm.append("password", process.env.SELLOSHIP_PASSWORD);

        const loginResponse = await axios.post(
            'https://selloship.com/api/lock_actvs/Vendor_login_from_vendor_all_order',
            loginForm,
            {
                headers: {
                    Authorization: '9f3017fd5aa17086b98e5305d64c232168052b46c77a3cc16a5067b',
                    ...loginForm.getHeaders(),
                },
            }
        );

        if (loginResponse.data.success !== "1") {
            return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
        }

        // Enrich orders with Selloship tracking info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            if (!order.selloShipAWB) {
                return { ...order.toObject(), trackingInfo: null };
            }

            const trackForm = new FormData();
            trackForm.append("vendor_id", loginResponse.data.vendor_id);
            trackForm.append("device_from", loginResponse.data.device_from);
            trackForm.append("tracking_id", order.selloShipAWB);

            try {
                const trackResponse = await axios.post(
                    'https://selloship.com/api/lock_actvs/tracking_detail',
                    trackForm,
                    {
                        headers: {
                            Authorization: loginResponse.data.access_token,
                            ...trackForm.getHeaders(),
                        },
                    }
                );

                const statusCode = trackResponse.data.status_code;

                // Determine new status
                const newStatus =
                    statusCode === "2" ? "Shipped" :
                        statusCode === "3" ? "Delivered" :
                            statusCode === "4" || statusCode === "5" ? "Returned" :
                                statusCode === "6" ? "Cancelled" :
                                    "Processing";

                // Update the order in the database if status changed
                if (order.status !== newStatus) {
                    await Order.findByIdAndUpdate(order._id, { status: newStatus });
                }

                return {
                    ...order.toObject(),
                    trackingInfo: trackResponse.data,
                    status: newStatus,
                };

            } catch (err) {
                console.error(`Tracking failed for order ${order._id}:`, err.message);
                return {
                    ...order.toObject(),
                    trackingInfo: null,
                };
            }
        }));


        // Filter by customer name (if search query is given)
        const enrichedOrdersWithImages = await Promise.all(enrichedOrders.map(async (order) => {
            const updatedCartItems = await Promise.all(order.cartItems.map(async (item) => {
                try {
                    let cleanProductId = item.id;

                    if (item.hasVariations && typeof item.id === "string" && item.id.includes("_")) {
                        cleanProductId = item.id.split("_")[0];
                    }
        
                    const product = await Product.findById(cleanProductId).select("productImage"); // or item._id if it's stored directly
                    return {
                        ...item,
                        img: product?.productImage || null, // fallback if img is not found
                    };
                } catch (err) {
                    console.error(`Failed to fetch product for item in order ${order._id}:`, err.message);
                    return item; // return item as-is if fetch fails
                }
            }));
        
            return {
                ...order,
                cartItems: updatedCartItems,
            };
        }));
        
        let finalOrders = enrichedOrdersWithImages;
        if (search && search.trim() !== "") {
            const lowerSearch = search.toLowerCase();
            finalOrders = enrichedOrdersWithImages.filter(order =>
                order.customerId?.fullname?.toLowerCase().includes(lowerSearch)
            );
        }

        // Final response
        res.status(200).json({
            orders: finalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: parseInt(page),
            success: true
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", success: false });
    }
};


// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order', success: false });
    }
};

export const getOrdersByCustomerId = async (req, res) => {
    try {
        const customerId = req.params.id;
        const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
        const loginForm = new FormData();
        loginForm.append("email", process.env.SELLOSHIP_EMAIL);
        loginForm.append("password", process.env.SELLOSHIP_PASSWORD);

        const loginResponse = await axios.post(
            'https://selloship.com/api/lock_actvs/Vendor_login_from_vendor_all_order',
            loginForm,
            {
                headers: {
                    Authorization: '9f3017fd5aa17086b98e5305d64c232168052b46c77a3cc16a5067b',
                    ...loginForm.getHeaders(),
                },
            }
        );

        if (loginResponse.data.success !== "1") {
            return res.status(401).json({ success: false, message: 'Selloship login failed', data: loginResponse.data });
        }

        // Enrich orders with Selloship tracking info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            if (!order.selloShipAWB) {
                return { ...order.toObject(), trackingInfo: null };
            }

            const trackForm = new FormData();
            trackForm.append("vendor_id", loginResponse.data.vendor_id);
            trackForm.append("device_from", loginResponse.data.device_from);
            trackForm.append("tracking_id", order.selloShipAWB);

            try {
                const trackResponse = await axios.post(
                    'https://selloship.com/api/lock_actvs/tracking_detail',
                    trackForm,
                    {
                        headers: {
                            Authorization: loginResponse.data.access_token,
                            ...trackForm.getHeaders(),
                        },
                    }
                );

                const statusCode = trackResponse.data.status_code;

                // Determine new status
                const newStatus =
                    statusCode === "2" ? "Shipped" :
                        statusCode === "3" ? "Delivered" :
                            statusCode === "4" || statusCode === "5" ? "Returned" :
                                statusCode === "6" ? "Cancelled" :
                                    "Processing";

                // Update the order in the database if status changed
                if (order.status !== newStatus) {
                    await Order.findByIdAndUpdate(order._id, { status: newStatus });
                }

                return {
                    ...order.toObject(),
                    trackingInfo: trackResponse.data,
                    status: newStatus,
                };

            } catch (err) {
                console.error(`Tracking failed for order ${order._id}:`, err.message);
                return {
                    ...order.toObject(),
                    trackingInfo: null,
                };
            }
        }));
        const enrichedOrdersWithImages = await Promise.all(enrichedOrders.map(async (order) => {
            const updatedCartItems = await Promise.all(order.cartItems.map(async (item) => {
                try {
                    let cleanProductId = item.id;

                    if (item.hasVariations && typeof item.id === "string" && item.id.includes("_")) {
                        cleanProductId = item.id.split("_")[0];
                    }
        
                    const product = await Product.findById(cleanProductId).select("productImage"); // or item._id if it's stored directly
                    return {
                        ...item,
                        img: product?.productImage || null, // fallback if img is not found
                    };
                } catch (err) {
                    console.error(`Failed to fetch product for item in order ${order._id}:`, err.message);
                    return item; // return item as-is if fetch fails
                }
            }));
        
            return {
                ...order,
                cartItems: updatedCartItems,
            };
        }));
        if (!enrichedOrdersWithImages) {
            return res.status(404).json({ message: "Orders not found", success: false });
        }
        res.status(200).json({ orders:enrichedOrdersWithImages, success: true });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', success: false });
    }
};



// Update order by ID
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId, orderType, cartItems, status, shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage } = req.body;

        const updatedData = {
            customerId,
            orderType,
            cartItems,
            status,
            shippingAddress, subtotal, totalDiscount, couponDiscount, shippingCharge, finalTotal, giftPacking, removePriceFromInvoice, addGiftMessage, giftMessage
        };

        const order = await Order.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }

        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete order by ID
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Failed to delete order', success: false });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndUpdate(id, { status: "Cancelled" });;
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        res.status(200).json({ order, success: true });
    } catch (error) {
        console.error('Error cancel order:', error);
        res.status(500).json({ message: 'Failed to cancel order', success: false });
    }
};

// Optional: Get all distinct statuses
export const getOrderStatuses = async (req, res) => {
    try {
        const statuses = await Order.distinct("status");
        res.status(200).json({ statuses, success: true });
    } catch (error) {
        console.error('Error fetching order statuses:', error);
        res.status(500).json({ message: 'Failed to fetch order statuses', success: false });
    }
};
