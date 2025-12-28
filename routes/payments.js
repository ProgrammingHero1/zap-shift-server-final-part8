const { verifyFBToken } = require('../middleware/auth');

function paymentRoutes(app, controllers) {
    const paymentController = controllers.payment;

    // Create checkout session
    app.post('/payment-checkout-session', (req, res) => paymentController.createCheckoutSession(req, res));

    // Handle payment success
    app.patch('/payment-success', (req, res) => paymentController.handlePaymentSuccess(req, res));

    // Get payments
    app.get('/payments', verifyFBToken, (req, res) => paymentController.getAllPayments(req, res));
}

module.exports = paymentRoutes;
