class TrackingController {
    constructor(models, collections) {
        this.Tracking = models.Tracking;
        this.Parcel = models.Parcel;
        this.User = models.User;
        this.collections = collections;
    }

    async getTrackingLogs(req, res) {
        try {
            const trackingId = req.params.trackingId;
            
            // Check if user has access to this tracking (via parcel ownership or assignment)
            const parcel = await this.Parcel.findByTrackingId(trackingId);
            if (!parcel) {
                return res.status(404).send({ message: 'tracking not found' });
            }
            
            const currentUser = await this.User.findByEmail(req.decoded_email);
            const isOwner = parcel.senderEmail === req.decoded_email;
            const isAssignedRider = parcel.riderEmail === req.decoded_email;
            const isAdmin = currentUser && currentUser.role === 'admin';
            
            if (!isOwner && !isAssignedRider && !isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            
            const result = await this.Tracking.findAllByTrackingId(trackingId);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching tracking logs', error: error.message });
        }
    }
}

module.exports = TrackingController;

