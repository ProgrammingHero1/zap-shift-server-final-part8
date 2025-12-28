const { verifyFBToken, verifyAdmin, verifyRider } = require('../middleware/auth');

function riderRoutes(app, controllers) {
    const riderController = controllers.rider;

    // Get all riders
    app.get('/riders', verifyFBToken, (req, res) => riderController.getAllRiders(req, res));

    // Get delivery stats per day (rider only)
    app.get('/riders/delivery-per-day', verifyFBToken, verifyRider, (req, res) => riderController.getDeliveryPerDay(req, res));

    // Create new rider
    app.post('/riders', (req, res) => riderController.createRider(req, res));

    // Update rider status (admin only)
    app.patch('/riders/:id', verifyFBToken, verifyAdmin, (req, res) => riderController.updateRiderStatus(req, res));
}

module.exports = riderRoutes;
