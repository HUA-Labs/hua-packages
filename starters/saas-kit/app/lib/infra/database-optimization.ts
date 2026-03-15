/**
 * Database optimization utilities
 *
 * Index creation, query optimization, performance monitoring
 */

import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * Create optimized indexes for performance
 */
export async function createOptimizedIndexes() {
  try {
    logger.info("Starting database index optimization");

    // 1. User-related indexes
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
      ON "User" (email) WHERE email IS NOT NULL;
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_nickname 
      ON "User" (nickname) WHERE nickname IS NOT NULL;
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_state 
      ON "User" (state);
    `;

    // 2. Notification-related indexes
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id 
      ON "Notification" (user_id);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at 
      ON "Notification" (created_at DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created 
      ON "Notification" (user_id, created_at DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read 
      ON "Notification" (is_read);
    `;

    // 5. Log-related indexes
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_logs_user_id 
      ON "LoginLog" (user_id);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_logs_created_at 
      ON "LoginLog" (created_at DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_created_at 
      ON "ApiLog" (created_at DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_created_at 
      ON "ErrorLog" (created_at DESC);
    `;

    // 5. Composite indexes (for frequent query patterns)
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_created
      ON "Notification" (user_id, is_read, created_at DESC);
    `;

    logger.info("Database index optimization complete");
  } catch (error) {
    console.error("[Error] Index creation failed:", error);
    throw error;
  }
}

/**
 * Analyze query performance
 */
export async function analyzeQueryPerformance() {
  try {
    logger.info("Starting query performance analysis");

    // 1. Check slow queries
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 1000  -- Over 1 second
      ORDER BY mean_time DESC 
      LIMIT 10;
    `;

    // 2. Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    // 3. Check index usage
    const indexUsage = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC;
    `;

    return {
      slowQueries,
      tableSizes,
      indexUsage,
    };
  } catch (error) {
    console.error("[Error] Query performance analysis failed:", error);
    throw error;
  }
}

/**
 * Clean up old database data (delete old logs)
 */
export async function cleanupOldData() {
  try {
    logger.info("Starting old data cleanup");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Delete old logs
    const deletedLoginLogs = await prisma.loginLog.deleteMany({
      where: {
        created_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    const deletedApiLogs = await prisma.apiLog.deleteMany({
      where: {
        created_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    const deletedErrorLogs = await prisma.errorLog.deleteMany({
      where: {
        created_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // 2. Delete read notifications (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        read: true,
        created_at: {
          lt: sevenDaysAgo,
        },
      },
    });

    logger.info("Data cleanup complete", {
      loginLogs: deletedLoginLogs.count,
      apiLogs: deletedApiLogs.count,
      errorLogs: deletedErrorLogs.count,
      notifications: deletedNotifications.count,
    });

    return {
      deletedLoginLogs: deletedLoginLogs.count,
      deletedApiLogs: deletedApiLogs.count,
      deletedErrorLogs: deletedErrorLogs.count,
      deletedNotifications: deletedNotifications.count,
    };
  } catch (error) {
    console.error("[Error] Data cleanup failed:", error);
    throw error;
  }
}

/**
 * Database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        'users' as table_name,
        COUNT(*) as count
      FROM "User"
      UNION ALL
      SELECT 
        'notifications' as table_name,
        COUNT(*) as count
      FROM "Notification"
      UNION ALL
      SELECT 
        'announcements' as table_name,
        COUNT(*) as count
      FROM "Announcement"
      UNION ALL
      SELECT 
        'events' as table_name,
        COUNT(*) as count
      FROM "Event"
      UNION ALL
      SELECT 
        'login_logs' as table_name,
        COUNT(*) as count
      FROM "LoginLog"
      UNION ALL
      SELECT 
        'api_logs' as table_name,
        COUNT(*) as count
      FROM "ApiLog"
      UNION ALL
      SELECT 
        'error_logs' as table_name,
        COUNT(*) as count
      FROM "ErrorLog";
    `;

    return stats;
  } catch (error) {
    console.error("[Error] Database statistics error:", error);
    throw error;
  }
}
