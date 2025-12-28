class RiderController {
    constructor(models, collections) {
        this.Rider = models.Rider;
        this.User = models.User;
        this.Parcel = models.Parcel;
        this.collections = collections;
    }

    async getAllRiders(req, res) {
        try {
            const { status, district, workStatus } = req.query;
            const query = {};

            if (status) {
                query.status = status;
            }
            if (district) {
                query.district = district;
            }
            if (workStatus) {
                query.workStatus = workStatus;
            }

            const result = await this.Rider.findAll(query);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching riders', error: error.message });
        }
    }

    async getDeliveryPerDay(req, res) {
        try {
            const email = req.decoded_email;
            const pipeline = [
                {
                    $match: {
                        riderEmail: email,
                        deliveryStatus: "parcel_delivered"
                    }
                },
                {
                    $lookup: {
                        from: "trackings",
                        localField: "trackingId",
                        foreignField: "trackingId",
                        as: "parcel_trackings"
                    }
                },
                {
                    $unwind: "$parcel_trackings"
                },
                {
                    $match: {
                        "parcel_trackings.status": "parcel_delivered"
                    }
                },
                {
                    $addFields: {
                        deliveryDay: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$parcel_trackings.createdAt"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$deliveryDay",
                        deliveredCount: { $sum: 1 }
                    }
                }
            ];

            const result = await this.collections.parcels.aggregate(pipeline).toArray();
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching delivery stats', error: error.message });
        }
    }

    async createRider(req, res) {
        try {
            const rider = req.body;
            const result = await this.Rider.create(rider);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error creating rider', error: error.message });
        }
    }

    async updateRiderStatus(req, res) {
        try {
            const status = req.body.status;
            const id = req.params.id;

            const result = await this.Rider.updateStatus(id, status);

            if (status === 'approved') {
                const email = req.body.email;
                await this.User.updateRoleByEmail(email, 'rider');
            }

            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error updating rider status', error: error.message });
        }
    }
}

module.exports = RiderController;

