class PaymentModel {
    constructor(collection) {
        this.collection = collection;
    }

    async findAll(filters = {}, sort = { paidAt: -1 }) {
        const cursor = this.collection.find(filters, { sort });
        return await cursor.toArray();
    }

    async findByTransactionId(transactionId) {
        const query = { transactionId };
        return await this.collection.findOne(query);
    }

    async create(paymentData) {
        paymentData.paidAt = new Date();
        const result = await this.collection.insertOne(paymentData);
        return result;
    }
}

module.exports = PaymentModel;

