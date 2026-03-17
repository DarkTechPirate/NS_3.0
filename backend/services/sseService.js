/**
 * Simple SSE Service to manage client connections and send real-time updates.
 */
class SSEService {
    constructor() {
        this.clients = new Map(); // userId -> Set of response objects
    }

    /**
     * Add a client connection
     * @param {string} userId 
     * @param {Object} res - Express response object
     */
    addClient(userId, res) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(res);

        // Remove client on connection close
        res.on('close', () => {
            const userClients = this.clients.get(userId);
            if (userClients) {
                userClients.delete(res);
                if (userClients.size === 0) {
                    this.clients.delete(userId);
                }
            }
        });
    }

    /**
     * Send data to all active connections of a specific user
     * @param {string} userId 
     * @param {Object} data 
     */
    sendUserData(userId, data) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const payload = `data: ${JSON.stringify(data)}\n\n`;
            userClients.forEach(res => {
                res.write(payload);
            });
        }
    }

    /**
     * Send data to multiple users
     * @param {string[]} userIds 
     * @param {Object} data 
     */
    broadcastToUsers(userIds, data) {
        userIds.forEach(userId => this.sendUserData(userId, data));
    }
}

module.exports = new SSEService();
