// Middleware to attach database collections to request object
const attachCollections = (collections) => {
    return (req, res, next) => {
        req.collections = collections;
        next();
    };
};

module.exports = { attachCollections };

