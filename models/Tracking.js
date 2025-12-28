class TrackingModel {
    constructor(collection) {
        this.collection = collection;
    }

    async findAllByTrackingId(trackingId) {
        const query = { trackingId };
        return await this.collection.find(query).toArray();
    }

    async create(logData) {
        logData.createdAt = new Date();
        const result = await this.collection.insertOne(logData);
        return result;
    }
}

module.exports = TrackingModel;

