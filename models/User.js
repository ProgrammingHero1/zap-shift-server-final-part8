const { ObjectId } = require('mongodb');

class UserModel {
    constructor(collection) {
        this.collection = collection;
    }

    async findAll(searchText = null, limit = 5) {
        const query = {};
        if (searchText) {
            query.$or = [
                { displayName: { $regex: searchText, $options: 'i' } },
                { email: { $regex: searchText, $options: 'i' } },
            ];
        }
        const cursor = this.collection.find(query).sort({ createdAt: -1 }).limit(limit);
        return await cursor.toArray();
    }

    async findById(id) {
        const query = { _id: new ObjectId(id) };
        return await this.collection.findOne(query);
    }

    async findByEmail(email) {
        const query = { email };
        return await this.collection.findOne(query);
    }

    async create(userData) {
        userData.role = userData.role || 'user';
        userData.createdAt = new Date();
        const result = await this.collection.insertOne(userData);
        return result;
    }

    async updateRole(id, role) {
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: { role }
        };
        return await this.collection.updateOne(query, updatedDoc);
    }

    async updateRoleByEmail(email, role) {
        const query = { email };
        const updatedDoc = {
            $set: { role }
        };
        return await this.collection.updateOne(query, updatedDoc);
    }

    async exists(email) {
        const user = await this.collection.findOne({ email });
        return !!user;
    }
}

module.exports = UserModel;

