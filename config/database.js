const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyznij5.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectDatabase() {
    try {
        await client.connect();
        const db = client.db('zap_shift_db');
        return {
            db,
            collections: {
                users: db.collection('users'),
                parcels: db.collection('parcels'),
                payments: db.collection('payments'),
                riders: db.collection('riders'),
                trackings: db.collection('trackings')
            }
        };
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

module.exports = { connectDatabase, client };

