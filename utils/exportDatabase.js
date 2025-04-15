const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const exportDatabase = async function (connectionUrl, outputFile) {
    const client = new MongoClient(connectionUrl, { useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();

        const dbName = new URL(connectionUrl).pathname.replace(/^\//, '');
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        let exportData = {};

        // Loop through collections
        for (let collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);

            // Extract schema
            const sampleDocument = await collection.findOne();
            const schema = {};
            for (let key in sampleDocument) {
                schema[key] = typeof sampleDocument[key];
            }

            // Extract data
            const data = await collection.find().toArray();

            // Add schema and data to exportData
            exportData[collectionName] = {
                schema: schema,
                data: data
            };
        }

        // Write export data to output file
        fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 4));
        console.log("Export completed successfully.");


        await client.close();
    } catch (err) {
        console.error("Error exporting MongoDB schema:", err);
        await client.close();
    } finally {
        await client.close();
    }
}


module.exports = exportDatabase;

