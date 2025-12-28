class UserController {
    constructor(models) {
        this.User = models.User;
        this.Parcel = models.Parcel;
    }

    async getAllUsers(req, res) {
        try {
            const searchText = req.query.searchText;
            const users = await this.User.findAll(searchText);
            res.send(users);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching users', error: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const id = req.params.id;
            const user = await this.User.findById(id);
            
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            
            // Users can only view their own profile, or admins can view any
            if (user.email !== req.decoded_email) {
                const currentUser = await this.User.findByEmail(req.decoded_email);
                if (!currentUser || currentUser.role !== 'admin') {
                    return res.status(403).send({ message: 'forbidden access' });
                }
            }
            
            res.send(user);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching user', error: error.message });
        }
    }

    async getUserRole(req, res) {
        try {
            const email = req.params.email;
            
            // Users can only check their own role, or admins can check any
            if (email !== req.decoded_email) {
                const currentUser = await this.User.findByEmail(req.decoded_email);
                if (!currentUser || currentUser.role !== 'admin') {
                    return res.status(403).send({ message: 'forbidden access' });
                }
            }
            
            const user = await this.User.findByEmail(email);
            res.send({ role: user?.role || 'user' });
        } catch (error) {
            res.status(500).send({ message: 'Error fetching user role', error: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const user = req.body;
            const email = user.email;
            const userExists = await this.User.exists(email);

            if (userExists) {
                return res.send({ message: 'user exists' });
            }

            const result = await this.User.create(user);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error creating user', error: error.message });
        }
    }

    async updateUserRole(req, res) {
        try {
            const id = req.params.id;
            const roleInfo = req.body;
            const result = await this.User.updateRole(id, roleInfo.role);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error updating user role', error: error.message });
        }
    }
}

module.exports = UserController;

