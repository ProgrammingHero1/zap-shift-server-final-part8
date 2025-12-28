const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { ObjectId } = require('mongodb');
const { logTracking } = require('../middleware/logging');

class PaymentController {
    constructor(models, collections) {
        this.Payment = models.Payment;
        this.Parcel = models.Parcel;
        this.collections = collections;
    }

    async createCheckoutSession(req, res) {
        try {
            const parcelInfo = req.body;
            const amount = parseInt(parcelInfo.cost) * 100;
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            unit_amount: amount,
                            product_data: {
                                name: `Please pay for: ${parcelInfo.parcelName}`
                            }
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                metadata: {
                    parcelId: parcelInfo.parcelId,
                    trackingId: parcelInfo.trackingId
                },
                customer_email: parcelInfo.senderEmail,
                success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
            });

            res.send({ url: session.url });
        } catch (error) {
            res.status(500).send({ message: 'Error creating checkout session', error: error.message });
        }
    }

    async handlePaymentSuccess(req, res) {
        try {
            const sessionId = req.query.session_id;
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            const transactionId = session.payment_intent;
            const paymentExist = await this.Payment.findByTransactionId(transactionId);
            
            if (paymentExist) {
                return res.send({
                    message: 'already exists',
                    transactionId,
                    trackingId: paymentExist.trackingId
                });
            }

            const trackingId = session.metadata.trackingId;

            if (session.payment_status === 'paid') {
                const id = session.metadata.parcelId;
                const update = {
                    paymentStatus: 'paid',
                    deliveryStatus: 'pending-pickup'
                };

                const result = await this.Parcel.update(id, update);

                const payment = {
                    amount: session.amount_total / 100,
                    currency: session.currency,
                    customerEmail: session.customer_email,
                    parcelId: session.metadata.parcelId,
                    parcelName: session.metadata.parcelName,
                    transactionId: session.payment_intent,
                    paymentStatus: session.payment_status,
                    trackingId: trackingId
                };

                const resultPayment = await this.Payment.create(payment);
                logTracking(this.collections.trackings, trackingId, 'parcel_paid');

                return res.send({
                    success: true,
                    modifyParcel: result,
                    trackingId: trackingId,
                    transactionId: session.payment_intent,
                    paymentInfo: resultPayment
                });
            }
            
            return res.send({ success: false });
        } catch (error) {
            res.status(500).send({ message: 'Error processing payment success', error: error.message });
        }
    }

    async getAllPayments(req, res) {
        try {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.customerEmail = email;

                // check email address
                if (email !== req.decoded_email) {
                    return res.status(403).send({ message: 'forbidden access' });
                }
            }

            const result = await this.Payment.findAll(query);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching payments', error: error.message });
        }
    }
}

module.exports = PaymentController;

