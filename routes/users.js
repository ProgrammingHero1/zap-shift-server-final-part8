const { verifyFBToken, verifyAdmin } = require('../middleware/auth');

function userRoutes(app, controllers) {
    const userController = controllers.user;

    // Get all users with search
    app.get('/users', verifyFBToken, (req, res) => userController.getAllUsers(req, res));

    // Get user by ID
    app.get('/users/:id', verifyFBToken, (req, res) => userController.getUserById(req, res));

    // Get user role by email
    app.get('/users/:email/role', verifyFBToken, (req, res) => userController.getUserRole(req, res));

    // Create new user
    app.post('/users', (req, res) => userController.createUser(req, res));

    // Update user role (admin only)
    app.patch('/users/:id/role', verifyFBToken, verifyAdmin, (req, res) => userController.updateUserRole(req, res));
}

module.exports = userRoutes;
