const { ObjectId } = require('mongodb');

class ParcelModel {
    constructor(collection) {
        this.collection = collection;
    }

    async findAll(filters = {}, sort = { createdAt: -1 }) {
        const options = { sort };
        const cursor = this.collection.find(filters, options);
        return await cursor.toArray();
    }

    async findById(id) {
        const query = { _id: new ObjectId(id) };
        return await this.collection.findOne(query);
    }

    async findByTrackingId(trackingId) {
        const query = { trackingId };
        return await this.collection.findOne(query);
    }

    async create(parcelData) {
        parcelData.createdAt = new Date();
        const result = await this.collection.insertOne(parcelData);
        return result;
    }

    async updateStatus(id, deliveryStatus) {
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: { deliveryStatus }
        };
        return await this.collection.updateOne(query, updatedDoc);
    }

    async update(id, updateData) {
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: updateData
        };
        return await this.collection.updateOne(query, updatedDoc);
    }

    async delete(id) {
        const query = { _id: new ObjectId(id) };
        return await this.collection.deleteOne(query);
    }

    async getDeliveryStatusStats() {
        const pipeline = [
            {
                $group: {
                    _id: '$deliveryStatus',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                }
            }
        ];
        return await this.collection.aggregate(pipeline).toArray();
    }
}

module.exports = ParcelModel;

