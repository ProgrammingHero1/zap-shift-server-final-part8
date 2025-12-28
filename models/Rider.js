const { ObjectId } = require('mongodb');

class RiderModel {
    constructor(collection) {
        this.collection = collection;
    }

    async findAll(filters = {}) {
        const cursor = this.collection.find(filters);
        return await cursor.toArray();
    }

    async findById(id) {
        const query = { _id: new ObjectId(id) };
        return await this.collection.findOne(query);
    }

    async create(riderData) {
        riderData.status = 'pending';
        riderData.createdAt = new Date();
        const result = await this.collection.insertOne(riderData);
        return result;
    }

    async updateStatus(id, status, workStatus = 'available') {
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: {
                status,
                workStatus
            }
        };
        return await this.collection.updateOne(query, updatedDoc);
    }

    async updateWorkStatus(id, workStatus) {
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: { workStatus }
        };
        return await this.collection.updateOne(query, updatedDoc);
    }
}

module.exports = RiderModel;

