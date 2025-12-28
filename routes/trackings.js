const { verifyFBToken } = require('../middleware/auth');

function trackingRoutes(app, controllers) {
    const trackingController = controllers.tracking;

    // Get tracking logs by tracking ID
    app.get('/trackings/:trackingId/logs', verifyFBToken, (req, res) => trackingController.getTrackingLogs(req, res));
}

module.exports = trackingRoutes;
