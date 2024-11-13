import { Webhook } from 'svix'
import userModel from '../models/userModel.js'
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

export { clerkWebhooks };