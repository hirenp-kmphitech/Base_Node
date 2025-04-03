const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

const importDatabase = async function (connectionUrl, dbName, inputFile) {
    const client = new MongoClient(connectionUrl, { useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();

        const db = client.db(dbName);

        // Read JSON data from input file
        const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

        // Loop through collections in the JSON data
        for (let collectionName in jsonData) {
            const collectionData = jsonData[collectionName];
            const collection = db.collection(collectionName);

            // Create collection if it doesn't exist
            const collectionExists = await collection.countDocuments({}) > 0;
            if (!collectionExists) {
                await db.createCollection(collectionName);
            }

            // Insert data into collection
            if (collectionData.data.length > 0) {
                await collection.insertMany(collectionData.data);
            }
        }

        console.log("Data imported successfully.");
        await client.close();
    } catch (err) {
        console.error("Error importing data to MongoDB:", err);
        await client.close();
    } finally {
        await client.close();
    }
}
module.exports = importDatabase;

