const logTracking = async (trackingsCollection, trackingId, status) => {
    const log = {
        trackingId,
        status,
        details: status.split('_').join(' '),
        createdAt: new Date()
    }
    const result = await trackingsCollection.insertOne(log);
    return result;
}

module.exports = { logTracking };

