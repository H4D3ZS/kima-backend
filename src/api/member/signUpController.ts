import type { Request, Response } from "express";
import express from "express";
import Error from "../../constants/error";
import { errorHandler, responseHandler } from "../../helpers/utils";
import { createUser } from "./member.model";
import stripe from "stripe"; 
import {STRIPE} from "config"

export const signUpRouter = express.Router();

const stripeSecretKey = STRIPE.STRIPE_SECRET; // Replace with your actual Stripe secret key
const stripeClient = new stripe(stripeSecretKey);

signUpRouter.post(
  "/:type(member|professional|business)",
  async (req: Request, res: Response) => {
    const type: string = req.params.type;
    try {

      if (type === "business" || type === "professional") {

        //save initial user as a member
        const user = await createUser({ userType: 'member', ...req.body });

        // Use Stripe Checkout for monthly subscription payment processing
        const session = await stripeClient.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price: STRIPE.SUBSCRIPTION_PRICE_ID, // Replace with your actual Stripe Price ID for the monthly subscription
              quantity: 1
            },
          ],
          success_url: STRIPE.SUCCESS_URL,
          cancel_url: STRIPE.CANCEL_URL,
          metadata: {
            // Add your user details here
             type, userId: user.id
          },
        });

        // Redirect the user to the Stripe Checkout page for subscription
        return res.json({url: session.url});
      }

      const user = await createUser({ userType: type, ...req.body });
      if (user)
        return responseHandler({
          status: 201,
          body: { message: `User ${user.email} Created`, data: user },
          res,
          req,
        });
      else
        return responseHandler({
          ...Error.notFound,
          res,
          req,
        });
    } catch (error: any) {
      return errorHandler({ error, res, req });
    }
  }
);
