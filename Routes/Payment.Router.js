import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const PaymentRoutes = express.Router();

PaymentRoutes.post('/orders', async (req, res) => {
    console.log("In Razor pay orders ======>")
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        console.log("In Razor pay orders ======>",2)
        const options = {
            amount: 50000, // Amount in the smallest currency unit
            currency: 'INR',
            receipt: 'receipt_order_74394',
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send('Some error occurred');

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
        console.log("Error ==>",error)
    }
});

PaymentRoutes.post('/success', async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: 'Transaction not legit!' });

        res.json({
            msg: 'success',
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

export default PaymentRoutes;
