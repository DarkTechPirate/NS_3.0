const { mediaQueue } = require("./queue");

/**
 * Adds a media processing job to the queue.
 * @param {Object} file - The file object from Multer.
 * @param {String} fileId - The ID of the database document to update (User ID or Gallery ID).
 * @param {String} modelName - The Mongoose model name ("User" or "Gallery").
 * @param {String} fieldName - The field in the model to update ("profilePicture" or "url").
 * @param {String} operation - The Mongoose operation ("set" or "push"). Defaults to "set".
 */
const enqueueMedia = async (file, fileId, modelName, fieldName, operation = "set") => {
    const timestamp = Date.now();
    const finalFilename = `${modelName.toLowerCase()}-${fileId}-${timestamp}.webp`;
    const objectKey = `${modelName.toLowerCase()}/${finalFilename}`;
    const publicPath = `/uploads/${objectKey}`;

    await mediaQueue.add("process-media", {
        fileId,
        filePath: file.path,
        mimeType: file.mimetype,
        outputDir: "public/uploads/",
        modelName,
        fieldName,
        operation, // Pass operation to worker
        finalFilename, // Pass specific name
        publicPath,    // Pass specific path
    });

    return publicPath;
};

module.exports = { enqueueMedia };
