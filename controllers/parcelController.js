const { generateTrackingId } = require('../utils/trackingId');
const { logTracking } = require('../middleware/logging');

class ParcelController {
    constructor(models, collections) {
        this.Parcel = models.Parcel;
        this.Rider = models.Rider;
        this.User = models.User;
        this.collections = collections;
    }

    async getAllParcels(req, res) {
        try {
            const query = {};
            const { email, deliveryStatus } = req.query;
            const currentUser = await this.User.findByEmail(req.decoded_email);

            // Non-admin users can only see their own parcels
            if (!currentUser || currentUser.role !== 'admin') {
                query.senderEmail = req.decoded_email;
            } else if (email) {
                // Admins can filter by email
                query.senderEmail = email;
            }

            if (deliveryStatus) {
                query.deliveryStatus = deliveryStatus;
            }

            const result = await this.Parcel.findAll(query);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching parcels', error: error.message });
        }
    }

    async getRiderParcels(req, res) {
        try {
            const { deliveryStatus } = req.query;
            const query = { riderEmail: req.decoded_email };

            if (deliveryStatus !== 'parcel_delivered') {
                query.deliveryStatus = { $nin: ['parcel_delivered'] };
            } else {
                query.deliveryStatus = deliveryStatus;
            }

            const result = await this.Parcel.findAll(query);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching rider parcels', error: error.message });
        }
    }

    async getParcelById(req, res) {
        try {
            const id = req.params.id;
            const parcel = await this.Parcel.findById(id);
            
            if (!parcel) {
                return res.status(404).send({ message: 'parcel not found' });
            }
            
            const currentUser = await this.User.findByEmail(req.decoded_email);
            const isOwner = parcel.senderEmail === req.decoded_email;
            const isAssignedRider = parcel.riderEmail === req.decoded_email;
            const isAdmin = currentUser && currentUser.role === 'admin';
            
            if (!isOwner && !isAssignedRider && !isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            
            res.send(parcel);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching parcel', error: error.message });
        }
    }

    async getDeliveryStatusStats(req, res) {
        try {
            const result = await this.Parcel.getDeliveryStatusStats();
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching delivery status stats', error: error.message });
        }
    }

    async createParcel(req, res) {
        try {
            const parcel = req.body;
            const trackingId = generateTrackingId();
            parcel.createdAt = new Date();
            parcel.trackingId = trackingId;
            parcel.senderEmail = req.decoded_email;

            logTracking(this.collections.trackings, trackingId, 'parcel_created');

            const result = await this.Parcel.create(parcel);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error creating parcel', error: error.message });
        }
    }

    async updateParcelStatus(req, res) {
        try {
            const { deliveryStatus, riderId, trackingId } = req.body;
            const id = req.params.id;
            
            const parcel = await this.Parcel.findById(id);
            if (!parcel) {
                return res.status(404).send({ message: 'parcel not found' });
            }
            
            const currentUser = await this.User.findByEmail(req.decoded_email);
            const isRider = currentUser && currentUser.role === 'rider';
            const isAdmin = currentUser && currentUser.role === 'admin';
            const isAssignedRider = parcel.riderEmail === req.decoded_email;
            
            // Only assigned riders or admins can update parcel status
            if (!isAdmin && !(isRider && isAssignedRider)) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            
            const result = await this.Parcel.updateStatus(id, deliveryStatus);

            if (deliveryStatus === 'parcel_delivered' && riderId) {
                await this.Rider.updateWorkStatus(riderId, 'available');
            }

            logTracking(this.collections.trackings, trackingId, deliveryStatus);

            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error updating parcel status', error: error.message });
        }
    }

    async assignRiderToParcel(req, res) {
        try {
            const { riderId, riderName, riderEmail, trackingId } = req.body;
            const id = req.params.id;

            const updatedDoc = {
                deliveryStatus: 'driver_assigned',
                riderId: riderId,
                riderName: riderName,
                riderEmail: riderEmail
            };

            const result = await this.Parcel.update(id, updatedDoc);
            await this.Rider.updateWorkStatus(riderId, 'in_delivery');
            logTracking(this.collections.trackings, trackingId, 'driver_assigned');

            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error assigning rider to parcel', error: error.message });
        }
    }

    async deleteParcel(req, res) {
        try {
            const id = req.params.id;
            const result = await this.Parcel.delete(id);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error deleting parcel', error: error.message });
        }
    }
}

module.exports = ParcelController;

