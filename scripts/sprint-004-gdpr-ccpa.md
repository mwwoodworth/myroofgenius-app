# Sprint 004: GDPR/CCPA Compliance & Data Privacy

## Executive Context

**Why This Matters**: Data privacy regulations like GDPR and CCPA carry severe penalties (up to 4% of global revenue or €20M for GDPR violations). MyRoofGenius must implement comprehensive privacy controls to operate legally in regulated markets while building customer trust through transparent data handling.

**What This Protects**:
- Legal compliance avoiding multi-million dollar fines
- Customer trust through transparent data practices
- Competitive advantage in privacy-conscious markets
- Business continuity by preventing regulatory shutdowns

## Implementation Steps

### 1. Privacy Database Schema

```sql
-- Data processing consents
CREATE TABLE privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL, -- 'marketing', 'analytics', 'data_sharing'
    status VARCHAR(50) NOT NULL, -- 'granted', 'withdrawn'
    version VARCHAR(20) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consent_user (user_id),
    INDEX idx_consent_tenant (tenant_id)
);

-- Data deletion requests
CREATE TABLE deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL, -- 'user', 'tenant'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deletion_summary JSONB,
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data export requests
CREATE TABLE export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL, -- 'user_data', 'tenant_data'
    format VARCHAR(20) NOT NULL DEFAULT 'json', -- 'json', 'csv', 'pdf'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    file_url VARCHAR(500),
    file_size_bytes BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE,
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for all data access
CREATE TABLE privacy_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    user_id UUID,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    data_categories JSONB DEFAULT '[]', -- ['personal', 'financial', 'technical']
    purpose VARCHAR(255),
    legal_basis VARCHAR(100), -- 'consent', 'contract', 'legitimate_interest'
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_tenant_created (tenant_id, created_at),
    INDEX idx_audit_user_created (user_id, created_at),
    INDEX idx_audit_action_created (action, created_at)
);

-- Data retention policies
CREATE TABLE retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    data_type VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    deletion_strategy VARCHAR(50) NOT NULL, -- 'hard_delete', 'anonymize'
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, data_type)
);

-- Data processing agreements
CREATE TABLE data_processing_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    processor_name VARCHAR(255) NOT NULL,
    processor_type VARCHAR(100) NOT NULL, -- 'sub_processor', 'joint_controller'
    purpose TEXT NOT NULL,
    data_categories JSONB NOT NULL DEFAULT '[]',
    security_measures TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    document_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Privacy Service Implementation

```typescript
// services/privacy.service.ts
import { db } from '../database';
import { Queue } from 'bullmq';
import crypto from 'crypto';
import { S3Service } from './s3.service';
import { EmailService } from './email.service';

export class PrivacyService {
  private deletionQueue: Queue;
  private exportQueue: Queue;
  
  constructor() {
    this.deletionQueue = new Queue('privacy-deletion', {
      connection: { host: process.env.REDIS_HOST }
    });
    
    this.exportQueue = new Queue('privacy-export', {
      connection: { host: process.env.REDIS_HOST }
    });
  }

  // Consent Management
  async recordConsent(
    userId: string,
    tenantId: string,
    consentType: string,
    status: 'granted' | 'withdrawn',
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await db.query(
      `INSERT INTO privacy_consents (
        user_id, tenant_id, consent_type, status, version, 
        ip_address, user_agent, ${status}_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [userId, tenantId, consentType, status, '1.0', ipAddress, userAgent]
    );

    // Audit log
    await this.auditLog({
      userId,
      tenantId,
      actorId: userId,
      action: `consent_${status}`,
      resourceType: 'consent',
      resourceId: consentType,
      dataCategories: ['personal'],
      purpose: 'consent_management',
      legalBasis: 'consent',
      ipAddress,
      userAgent
    });
  }

  async getActiveConsents(userId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT DISTINCT ON (consent_type) 
        consent_type, status, version, granted_at, withdrawn_at
       FROM privacy_consents
       WHERE user_id = $1
       ORDER BY consent_type, created_at DESC`,
      [userId]
    );
    
    return result.rows.filter(c => c.status === 'granted');
  }

  // Data Deletion
  async requestDeletion(
    requestType: 'user' | 'tenant',
    targetId: string,
    requestedBy: string
  ): Promise<string> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const result = await db.query(
      `INSERT INTO deletion_requests (
        ${requestType}_id, request_type, requested_by, 
        verification_token, verification_expires_at,
        scheduled_for
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        targetId, 
        requestType, 
        requestedBy, 
        verificationToken,
        verificationExpiresAt,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days grace period
      ]
    );

    // Send verification email
    await this.sendDeletionVerificationEmail(
      requestType,
      targetId,
      verificationToken
    );

    // Audit log
    await this.auditLog({
      userId: requestType === 'user' ? targetId : null,
      tenantId: requestType === 'tenant' ? targetId : null,
      actorId: requestedBy,
      action: 'deletion_requested',
      resourceType: requestType,
      resourceId: targetId,
      dataCategories: ['all'],
      purpose: 'data_deletion',
      legalBasis: 'legal_obligation'
    });

    return result.rows[0].id;
  }

  async verifyDeletion(
    requestId: string,
    verificationToken: string
  ): Promise<boolean> {
    const result = await db.query(
      `UPDATE deletion_requests 
       SET status = 'verified'
       WHERE id = $1 
       AND verification_token = $2 
       AND verification_expires_at > CURRENT_TIMESTAMP
       AND status = 'pending'
       RETURNING id`,
      [requestId, verificationToken]
    );

    if (result.rowCount > 0) {
      // Schedule deletion job
      await this.deletionQueue.add('process-deletion', {
        requestId
      }, {
        delay: 24 * 60 * 60 * 1000 // 24 hour delay for accidental deletion protection
      });
      
      return true;
    }
    
    return false;
  }

  async processDeletion(requestId: string): Promise<void> {
    const request = await db.query(
      `SELECT * FROM deletion_requests WHERE id = $1`,
      [requestId]
    );

    if (!request.rows[0] || request.rows[0].status !== 'verified') {
      throw new Error('Invalid deletion request');
    }

    const { request_type, user_id, tenant_id } = request.rows[0];
    const deletionSummary: any = {};

    await db.query('BEGIN');

    try {
      if (request_type === 'user') {
        deletionSummary.user = await this.deleteUserData(user_id);
      } else if (request_type === 'tenant') {
        deletionSummary.tenant = await this.deleteTenantData(tenant_id);
      }

      // Update request
      await db.query(
        `UPDATE deletion_requests 
         SET status = 'completed',
             completed_at = CURRENT_TIMESTAMP,
             deletion_summary = $1
         WHERE id = $2`,
        [JSON.stringify(deletionSummary), requestId]
      );

      await db.query('COMMIT');

      // Send confirmation
      await this.sendDeletionConfirmationEmail(request_type, user_id || tenant_id);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  private async deleteUserData(userId: string): Promise<any> {
    const summary: any = { tables: {} };

    // Define deletion order (respecting foreign keys)
    const deletionPlan = [
      { table: 'api_usage', column: 'user_id' },
      { table: 'privacy_audit_log', column: 'user_id' },
      { table: 'privacy_consents', column: 'user_id' },
      { table: 'estimates', column: 'created_by' },
      { table: 'projects', column: 'created_by' },
      { table: 'tenant_users', column: 'user_id' },
      { table: 'users', column: 'id', anonymize: true }
    ];

    for (const step of deletionPlan) {
      if (step.anonymize) {
        // Anonymize instead of delete
        const result = await db.query(
          `UPDATE ${step.table} 
           SET email = CONCAT('deleted_', id, '@example.com'),
               name = 'Deleted User',
               phone = NULL,
               avatar_url = NULL,
               metadata = '{}'
           WHERE ${step.column} = $1`,
          [userId]
        );
        summary.tables[step.table] = { anonymized: result.rowCount };
      } else {
        // Hard delete
        const result = await db.query(
          `DELETE FROM ${step.table} WHERE ${step.column} = $1`,
          [userId]
        );
        summary.tables[step.table] = { deleted: result.rowCount };
      }
    }

    // Delete from external systems
    summary.external = await this.deleteExternalUserData(userId);

    return summary;
  }

  private async deleteTenantData(tenantId: string): Promise<any> {
    const summary: any = { tables: {} };

    // Get all tenant data for backup before deletion
    const backup = await this.createTenantBackup(tenantId);
    summary.backupId = backup.id;

    // Delete in order
    const deletionPlan = [
      'api_usage',
      'webhook_deliveries',
      'webhook_endpoints',
      'api_keys',
      'partners',
      'invoices',
      'usage_events',
      'usage_metrics',
      'subscriptions',
      'estimates',
      'projects',
      'materials',
      'labor_rates',
      'documents',
      'tenant_users',
      'tenants'
    ];

    for (const table of deletionPlan) {
      const result = await db.query(
        `DELETE FROM ${table} WHERE tenant_id = $1`,
        [tenantId]
      );
      summary.tables[table] = { deleted: result.rowCount };
    }

    // Delete from external systems
    summary.external = await this.deleteExternalTenantData(tenantId);

    return summary;
  }

  // Data Export
  async requestExport(
    requestType: 'user_data' | 'tenant_data',
    targetId: string,
    requestedBy: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string> {
    const result = await db.query(
      `INSERT INTO export_requests (
        ${requestType === 'user_data' ? 'user_id' : 'tenant_id'},
        request_type, format, requested_by
      ) VALUES ($1, $2, $3, $4) RETURNING id`,
      [targetId, requestType, format, requestedBy]
    );

    const requestId = result.rows[0].id;

    // Queue export job
    await this.exportQueue.add('process-export', {
      requestId,
      requestType,
      targetId,
      format
    });

    // Audit log
    await this.auditLog({
      userId: requestType === 'user_data' ? targetId : null,
      tenantId: requestType === 'tenant_data' ? targetId : null,
      actorId: requestedBy,
      action: 'export_requested',
      resourceType: requestType,
      resourceId: targetId,
      dataCategories: ['all'],
      purpose: 'data_portability',
      legalBasis: 'legal_obligation'
    });

    return requestId;
  }

  async processExport(
    requestId: string,
    requestType: string,
    targetId: string,
    format: string
  ): Promise<void> {
    try {
      let data: any;
      
      if (requestType === 'user_data') {
        data = await this.collectUserData(targetId);
      } else {
        data = await this.collectTenantData(targetId);
      }

      // Format data
      let exportFile: Buffer;
      let contentType: string;
      let extension: string;

      switch (format) {
        case 'csv':
          exportFile = await this.formatAsCSV(data);
          contentType = 'text/csv';
          extension = 'csv';
          break;
        case 'pdf':
          exportFile = await this.formatAsPDF(data);
          contentType = 'application/pdf';
          extension = 'pdf';
          break;
        default:
          exportFile = Buffer.from(JSON.stringify(data, null, 2));
          contentType = 'application/json';
          extension = 'json';
      }

      // Upload to S3 with encryption
      const filename = `exports/${requestId}/data-export.${extension}`;
      const s3Result = await S3Service.upload(
        filename,
        exportFile,
        {
          ContentType: contentType,
          ServerSideEncryption: 'AES256',
          Metadata: {
            requestId,
            requestType,
            targetId
          }
        }
      );

      // Generate signed URL (expires in 7 days)
      const downloadUrl = await S3Service.getSignedUrl(filename, 7 * 24 * 60 * 60);

      // Update request
      await db.query(
        `UPDATE export_requests 
         SET status = 'completed',
             file_url = $1,
             file_size_bytes = $2,
             expires_at = $3,
             completed_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [downloadUrl, exportFile.length, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), requestId]
      );

      // Send notification
      await this.sendExportReadyEmail(requestId, downloadUrl);
    } catch (error) {
      await db.query(
        `UPDATE export_requests 
         SET status = 'failed',
             metadata = metadata || $1
         WHERE id = $2`,
        [JSON.stringify({ error: error.message }), requestId]
      );
      throw error;
    }
  }

  private async collectUserData(userId: string): Promise<any> {
    const userData: any = {
      exportDate: new Date().toISOString(),
      dataSubject: {},
      personalData: {},
      usage: {},
      consents: [],
      communications: []
    };

    // Basic user info
    const user = await db.query(
      `SELECT id, email, name, phone, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );
    userData.dataSubject = user.rows[0];

    // Projects and estimates
    userData.projects = await db.query(
      `SELECT * FROM projects WHERE created_by = $1`,
      [userId]
    ).then(r => r.rows);

    userData.estimates = await db.query(
      `SELECT * FROM estimates WHERE created_by = $1`,
      [userId]
    ).then(r => r.rows);

    // Usage data
    userData.usage = await db.query(
      `SELECT event_type, COUNT(*) as count, MAX(created_at) as last_used
       FROM usage_events 
       WHERE metadata->>'userId' = $1
       GROUP BY event_type`,
      [userId]
    ).then(r => r.rows);

    // Consents
    userData.consents = await db.query(
      `SELECT consent_type, status, version, granted_at, withdrawn_at
       FROM privacy_consents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ).then(r => r.rows);

    // Audit trail
    userData.auditTrail = await db.query(
      `SELECT action, resource_type, created_at
       FROM privacy_audit_log
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1000`,
      [userId]
    ).then(r => r.rows);

    return userData;
  }

  private async collectTenantData(tenantId: string): Promise<any> {
    const tenantData: any = {
      exportDate: new Date().toISOString(),
      tenant: {},
      users: [],
      projects: [],
      estimates: [],
      materials: [],
      documents: [],
      usage: {},
      billing: {}
    };

    // Get all tenant tables
    const tables = [
      'tenants', 'users', 'projects', 'estimates', 
      'materials', 'labor_rates', 'documents'
    ];

    for (const table of tables) {
      const result = await db.query(
        `SELECT * FROM ${table} WHERE tenant_id = $1`,
        [tenantId]
      );
      tenantData[table] = result.rows;
    }

    return tenantData;
  }

  // Audit Logging
  async auditLog(params: {
    userId?: string;
    tenantId?: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    dataCategories?: string[];
    purpose?: string;
    legalBasis?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    await db.query(
      `INSERT INTO privacy_audit_log (
        user_id, tenant_id, actor_id, action, resource_type, resource_id,
        data_categories, purpose, legal_basis, ip_address, user_agent, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        params.userId,
        params.tenantId,
        params.actorId,
        params.action,
        params.resourceType,
        params.resourceId,
        JSON.stringify(params.dataCategories || []),
        params.purpose,
        params.legalBasis,
        params.ipAddress,
        params.userAgent,
        JSON.stringify(params.metadata || {})
      ]
    );
  }

  // Data Retention
  async applyRetentionPolicies(): Promise<void> {
    const policies = await db.query(
      `SELECT * FROM retention_policies 
       WHERE is_active = TRUE 
       AND (next_run_at IS NULL OR next_run_at <= CURRENT_TIMESTAMP)`
    );

    for (const policy of policies.rows) {
      await this.applyRetentionPolicy(policy);
    }
  }

  private async applyRetentionPolicy(policy: any): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

    let result;
    
    switch (policy.data_type) {
      case 'audit_logs':
        if (policy.deletion_strategy === 'hard_delete') {
          result = await db.query(
            `DELETE FROM privacy_audit_log 
             WHERE tenant_id = $1 AND created_at < $2`,
            [policy.tenant_id, cutoffDate]
          );
        }
        break;
        
      case 'usage_events':
        if (policy.deletion_strategy === 'anonymize') {
          result = await db.query(
            `UPDATE usage_events 
             SET metadata = '{}' 
             WHERE tenant_id = $1 AND created_at < $2`,
            [policy.tenant_id, cutoffDate]
          );
        }
        break;
    }

    // Update policy
    await db.query(
      `UPDATE retention_policies 
       SET last_run_at = CURRENT_TIMESTAMP,
           next_run_at = CURRENT_TIMESTAMP + INTERVAL '1 day'
       WHERE id = $1`,
      [policy.id]
    );

    // Audit log
    await this.auditLog({
      tenantId: policy.tenant_id,
      actorId: 'system',
      action: 'retention_policy_applied',
      resourceType: 'retention_policy',
      resourceId: policy.id,
      metadata: {
        dataType: policy.data_type,
        recordsAffected: result?.rowCount || 0,
        cutoffDate
      }
    });
  }
}
```

### 3. Privacy API Endpoints

```typescript
// routes/privacy.routes.ts
import { Router } from 'express';
import { PrivacyController } from '../controllers/privacy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Consent management
router.post('/privacy/consents',
  authenticate,
  body('consentType').isIn(['marketing', 'analytics', 'data_sharing']),
  body('status').isIn(['granted', 'withdrawn']),
  validateRequest,
  PrivacyController.updateConsent
);

router.get('/privacy/consents',
  authenticate,
  PrivacyController.getConsents
);

// Data export
router.post('/privacy/export',
  authenticate,
  body('format').optional().isIn(['json', 'csv', 'pdf']),
  validateRequest,
  PrivacyController.requestExport
);

router.get('/privacy/export/:requestId',
  authenticate,
  param('requestId').isUUID(),
  validateRequest,
  PrivacyController.getExportStatus
);

// Data deletion
router.post('/privacy/deletion',
  authenticate,
  PrivacyController.requestDeletion
);

router.post('/privacy/deletion/:requestId/verify',
  param('requestId').isUUID(),
  body('token').notEmpty(),
  validateRequest,
  PrivacyController.verifyDeletion
);

router.post('/privacy/deletion/:requestId/cancel',
  authenticate,
  param('requestId').isUUID(),
  validateRequest,
  PrivacyController.cancelDeletion
);

// Audit trail
router.get('/privacy/audit-trail',
  authenticate,
  PrivacyController.getAuditTrail
);

// Data Processing Agreements (admin only)
router.get('/privacy/processors',
  authenticate,
  authorize('admin'),
  PrivacyController.getDataProcessors
);

router.post('/privacy/processors',
  authenticate,
  authorize('admin'),
  body('processorName').notEmpty(),
  body('purpose').notEmpty(),
  body('dataCategories').isArray(),
  validateRequest,
  PrivacyController.addDataProcessor
);

// Cookie preferences
router.get('/privacy/cookie-preferences',
  PrivacyController.getCookiePreferences
);

router.post('/privacy/cookie-preferences',
  body('preferences').isObject(),
  validateRequest,
  PrivacyController.updateCookiePreferences
);

export default router;
```

### 4. Privacy UI Components

```typescript
// components/privacy/PrivacyCenter.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ConsentManager } from './ConsentManager';
import { DataExport } from './DataExport';
import { DataDeletion } from './DataDeletion';
import { AuditTrail } from './AuditTrail';

export function PrivacyCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [privacyData, setPrivacyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      const [consents, exports, deletions] = await Promise.all([
        api.get('/privacy/consents'),
        api.get('/privacy/export'),
        api.get('/privacy/deletion')
      ]);

      setPrivacyData({
        consents: consents.data,
        exports: exports.data,
        deletions: deletions.data
      });
    } catch (error) {
      console.error('Failed to load privacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Privacy Center</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your data privacy settings and preferences
          </p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {['overview', 'consents', 'export', 'deletion', 'audit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <PrivacyOverview data={privacyData} />}
              {activeTab === 'consents' && <ConsentManager />}
              {activeTab === 'export' && <DataExport />}
              {activeTab === 'deletion' && <DataDeletion />}
              {activeTab === 'audit' && <AuditTrail />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// components/privacy/ConsentManager.tsx
export function ConsentManager() {
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const response = await api.get('/privacy/consents');
      setConsents(response.data);
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, status: string) => {
    try {
      await api.post('/privacy/consents', {
        consentType,
        status
      });
      await loadConsents();
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  const consentTypes = [
    {
      type: 'marketing',
      title: 'Marketing Communications',
      description: 'Receive promotional emails and product updates'
    },
    {
      type: 'analytics',
      title: 'Analytics & Performance',
      description: 'Help us improve our services by sharing usage data'
    },
    {
      type: 'data_sharing',
      title: 'Partner Data Sharing',
      description: 'Share data with trusted partners for enhanced features'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Consent Preferences</h2>
        <p className="mt-1 text-sm text-gray-600">
          Control how we use your data
        </p>
      </div>

      <div className="space-y-4">
        {consentTypes.map((consentType) => {
          const consent = consents.find(c => c.consent_type === consentType.type);
          const isGranted = consent?.status === 'granted';

          return (
            <div key={consentType.type} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {consentType.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {consentType.description}
                  </p>
                  {consent && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(consent.granted_at || consent.withdrawn_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => updateConsent(
                    consentType.type,
                    isGranted ? 'withdrawn' : 'granted'
                  )}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
                    rounded-full border-2 border-transparent transition-colors 
                    duration-200 ease-in-out focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:ring-offset-2
                    ${isGranted ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform 
                      rounded-full bg-white shadow ring-0 transition 
                      duration-200 ease-in-out
                      ${isGranted ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// components/privacy/DataExport.tsx
export function DataExport() {
  const [exports, setExports] = useState<any[]>([]);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    try {
      const response = await api.get('/privacy/export');
      setExports(response.data);
    } catch (error) {
      console.error('Failed to load exports:', error);
    }
  };

  const requestExport = async (format: string) => {
    try {
      setRequesting(true);
      await api.post('/privacy/export', { format });
      await loadExports();
      alert('Export requested. You will receive an email when it\'s ready.');
    } catch (error) {
      console.error('Failed to request export:', error);
      alert('Failed to request export');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Data Export</h2>
        <p className="mt-1 text-sm text-gray-600">
          Download a copy of your data
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800">Request Data Export</h3>
        <p className="mt-1 text-sm text-blue-700">
          Export includes all your personal data, projects, estimates, and usage history.
        </p>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => requestExport('json')}
            disabled={requesting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Export as JSON
          </button>
          <button
            onClick={() => requestExport('csv')}
            disabled={requesting}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 disabled:opacity-50"
          >
            Export as CSV
          </button>
          <button
            onClick={() => requestExport('pdf')}
            disabled={requesting}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 disabled:opacity-50"
          >
            Export as PDF
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Export History</h3>
        {exports.length === 0 ? (
          <p className="text-sm text-gray-500">No exports requested yet</p>
        ) : (
          <div className="space-y-2">
            {exports.map((exp) => (
              <div key={exp.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {exp.format.toUpperCase()} Export
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested: {new Date(exp.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {exp.status === 'completed' ? (
                      <a
                        href={exp.file_url}
                        className="text-sm text-blue-600 hover:text-blue-700"
                        download
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {exp.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Compliance Testing Framework

```typescript
// tests/compliance/gdpr.test.ts
import { PrivacyService } from '../../services/privacy.service';
import { db } from '../../database';

describe('GDPR Compliance Tests', () => {
  let privacyService: PrivacyService;
  let testUserId: string;
  let testTenantId: string;

  beforeAll(async () => {
    privacyService = new PrivacyService();
    // Create test data
    const user = await createTestUser();
    testUserId = user.id;
    testTenantId = user.tenantId;
  });

  describe('Right to Access (Article 15)', () => {
    it('should export all user data within 30 days', async () => {
      const requestId = await privacyService.requestExport(
        'user_data',
        testUserId,
        testUserId
      );

      // Process export immediately for test
      await privacyService.processExport(
        requestId,
        'user_data',
        testUserId,
        'json'
      );

      const result = await db.query(
        `SELECT * FROM export_requests WHERE id = $1`,
        [requestId]
      );

      expect(result.rows[0].status).toBe('completed');
      expect(result.rows[0].file_url).toBeDefined();

      // Verify exported data contains all required information
      const exportData = await downloadAndParseExport(result.rows[0].file_url);
      expect(exportData).toHaveProperty('dataSubject');
      expect(exportData).toHaveProperty('personalData');
      expect(exportData).toHaveProperty('usage');
      expect(exportData).toHaveProperty('consents');
    });

    it('should include data from all integrated systems', async () => {
      // Add data across different systems
      await createEstimate(testUserId);
      await