const { verifyFBToken, verifyAdmin, verifyRider } = require('../middleware/auth');

function parcelRoutes(app, controllers) {
    const parcelController = controllers.parcel;

    // Get all parcels
    app.get('/parcels', verifyFBToken, (req, res) => parcelController.getAllParcels(req, res));

    // Get parcels for rider
    app.get('/parcels/rider', verifyFBToken, verifyRider, (req, res) => parcelController.getRiderParcels(req, res));

    // Get parcel by ID
    app.get('/parcels/:id', verifyFBToken, (req, res) => parcelController.getParcelById(req, res));

    // Get delivery status stats (admin only)
    app.get('/parcels/delivery-status/stats', verifyFBToken, verifyAdmin, (req, res) => parcelController.getDeliveryStatusStats(req, res));

    // Create new parcel
    app.post('/parcels', verifyFBToken, (req, res) => parcelController.createParcel(req, res));

    // Update parcel status
    app.patch('/parcels/:id/status', verifyFBToken, (req, res) => parcelController.updateParcelStatus(req, res));

    // Assign rider to parcel (admin only)
    app.patch('/parcels/:id', verifyFBToken, verifyAdmin, (req, res) => parcelController.assignRiderToParcel(req, res));

    // Delete parcel (admin only)
    app.delete('/parcels/:id', verifyFBToken, verifyAdmin, (req, res) => parcelController.deleteParcel(req, res));
}

module.exports = parcelRoutes;
