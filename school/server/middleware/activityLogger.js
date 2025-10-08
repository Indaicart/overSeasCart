const db = require('../db/connection');

/**
 * Middleware to log user activities
 */
const activityLogger = {
  /**
   * Log an activity
   * @param {Object} params - Activity parameters
   * @param {number} params.schoolId - School ID
   * @param {number} params.userId - User ID
   * @param {string} params.action - Action performed (create, update, delete, login, etc.)
   * @param {string} params.resourceType - Type of resource affected
   * @param {number} params.resourceId - ID of affected resource
   * @param {string} params.description - Human-readable description
   * @param {Object} params.metadata - Additional data
   * @param {Object} params.req - Express request object (for IP and user agent)
   */
  async log({ schoolId, userId, action, resourceType, resourceId, description, metadata = {}, req }) {
    try {
      await db('activity_logs').insert({
        school_id: schoolId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        description,
        metadata: JSON.stringify(metadata),
        ip_address: req ? (req.ip || req.connection.remoteAddress) : null,
        user_agent: req ? req.get('user-agent') : null
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error - logging should not break the application
    }
  },

  /**
   * Express middleware to automatically log certain actions
   */
  middleware(action, resourceType, getDescription) {
    return async (req, res, next) => {
      // Store original send function
      const originalSend = res.send;

      // Override send function to log after successful response
      res.send = function(data) {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const description = typeof getDescription === 'function' 
            ? getDescription(req, res) 
            : getDescription;

          activityLogger.log({
            schoolId: req.user?.schoolId,
            userId: req.user?.id,
            action,
            resourceType,
            resourceId: req.params.id || req.body.id,
            description,
            metadata: {
              body: req.body,
              params: req.params,
              query: req.query
            },
            req
          }).catch(err => console.error('Activity logging error:', err));
        }

        // Call original send function
        return originalSend.call(this, data);
      };

      next();
    };
  }
};

module.exports = activityLogger;
