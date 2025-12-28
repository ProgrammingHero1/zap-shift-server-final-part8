const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { attachCollections } = require('./middleware/collections');
const { initializeModels } = require('./models');
const { initializeControllers } = require('./controllers');

// Import routes
const userRoutes = require('./routes/users');
const parcelRoutes = require('./routes/parcels');
const paymentRoutes = require('./routes/payments');
const riderRoutes = require('./routes/riders');
const trackingRoutes = require('./routes/trackings');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root endpoint
app.get('/', (req, res) => {
    res.send('zap is shifting shifting!')
});

// Initialize database and start server
async function startServer() {
    try {
        // Connect to database
        const { collections } = await connectDatabase();
        console.log('Connected to MongoDB successfully');

        // Attach collections to all requests
        app.use(attachCollections(collections));

        // Initialize models and controllers
        const models = initializeModels(collections);
        const controllers = initializeControllers(models, collections);

        // Register all routes
        userRoutes(app, controllers);
        parcelRoutes(app, controllers);
        paymentRoutes(app, controllers);
        riderRoutes(app, controllers);
        trackingRoutes(app, controllers);

        // Start server
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
