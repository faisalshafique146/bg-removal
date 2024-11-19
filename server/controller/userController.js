import { Webhook } from 'svix'
import userModel from '../models/userModel.js'
import razorpay from 'razorpay';
import transactionModel from '../models/transactionModel.js';

// Api Controller Function to Manage Clerk User with Database
// http://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify(req.body), {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature']
        })

        const { data, type } = req.body

        switch (type) {
            case 'user.created':
                // Handle user created event
                {
                    const userData = {
                        clerkId: data.id,
                        email: data.email_addresses[0].email_address,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        photo: data.image_url,
                    }
                    await userModel.create(userData)
                    res.json({})
                    break;
                }
            case 'user.updated':
                // Handle user updated event
                {
                    const userData = {
                        email: data.email_addresses[0].email_address,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        photo: data.image_url,
                    }
                    await userModel.findOneAndUpdate({ clerkId: data.id }, userData)
                    res.json({})
                    break;
                }
            case 'user.deleted':
                // Handle user deleted event
                {
                    await userModel.findOneAndDelete({ clerkId: data.id })
                    res.json({})
                    break;
                }
            default:
                // throw new Error('Invalid event type')
                break;
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
};


// Api Controller Function to get user available credit data
const userCredits = async (req, res) => {
    try {
        const { clerkId } = req.body

        const userData = await userModel.findOne({ clerkId })
        res.json({ success: true, credits: userData.creditBalance })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// gateway initialization
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Api to make payment for credits
const paymentRazorpay = async (req, res) => {
    try {
        const { clerkId, planId } = req.body;
        const userData = await userModel.findOne({
            clerkId
        });
        if (!userData || !planId) {
            return res.json({
                success: false,
                message: "Invalid Credentials"
            });
        }
        let credits, plan, amount, date;
        switch (planId) {
            case 'Basic':
                plan = "Basic";
                credits = 100;
                amount = 10;
                break;
            case 'Advanced':
                plan = "Advanced";
                credits = 500;
                amount = 50;
                break;
            case 'Business':
                plan = "Business";
                credits = 5000;
                amount = 250;
                break;
            default:
                break;
        }
        date = new Date();

        // creating transaction
        const transactionData = {
            clerkId,
            plan,
            amount,
            credits,
            date
        };
        const newTransaction = await transactionModel.create(transactionData);

        // creating order
        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            receipt: newTransaction._id
        };
        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error, "error");
                return res.json({
                    success: false,
                    message: error.message
                });
            }
            res.json({
                success: true,
                order
            });
        });
    } catch (error) {
        console.log(error,"error");
        
        res.json({ success: false, message: error.message });
    }
}
export { clerkWebhooks, userCredits, paymentRazorpay };