# Sprint 008: Data Persistence

## Why This Matters
Your data architecture is the foundation of trust. When an estimator's laptop crashes at 11 PM with tomorrow's bid half-complete, or when they need last year's actuals to validate today's assumptions—your persistence layer determines whether they're protected or starting over. This isn't about databases. It's about never losing work that represents hours of analysis and critical business intelligence.

## What This Protects
- **Work investment**: Every calculation, adjustment, and analysis preserved
- **Institutional knowledge**: Historical patterns become predictive power
- **Business continuity**: Seamless work across devices, locations, and interruptions

## Implementation Steps

### 1. Database Architecture

**Core Schema Design:**
```sql
-- Companies and Users
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'trial',
  subscription_expires_at TIMESTAMP,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- estimator, architect, owner
  settings JSONB DEFAULT '{}',
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects and Estimates
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}', -- building_type, location, etc.
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft delete support
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Financial data
  base_cost DECIMAL(12,2),
  total_risk_adjustment DECIMAL(12,2),
  final_bid DECIMAL(12,2),
  target_margin DECIMAL(5,2),
  
  -- Detailed breakdown stored as JSONB for flexibility
  cost_breakdown JSONB DEFAULT '{}',
  risk_analysis JSONB DEFAULT '{}',
  
  -- Audit trail
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  
  -- Version control
  parent_version_id UUID REFERENCES estimates(id),
  version_notes TEXT
);

-- Risk tracking
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  risk_type VARCHAR(100) NOT NULL,
  probability DECIMAL(3,2) CHECK (probability >= 0 AND probability <= 1),
  impact_low DECIMAL(10,2),
  impact_high DECIMAL(10,2),
  mitigation_strategy TEXT,
  mitigation_cost DECIMAL(10,2),
  
  -- Track if mitigation was applied
  mitigation_applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP,
  applied_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical data for pattern learning
CREATE TABLE project_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id),
  
  -- What actually happened
  actual_cost DECIMAL(12,2),
  actual_duration_days INTEGER,
  actual_issues JSONB DEFAULT '[]', -- Array of discovered issues
  
  -- Lessons learned
  variance_analysis JSONB DEFAULT '{}',
  lessons_learned TEXT[],
  
  recorded_by UUID REFERENCES users(id),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit and activity logging
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_company_status ON projects(company_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_estimates_project_version ON estimates(project_id, version DESC);
CREATE INDEX idx_risk_assessments_estimate ON risk_assessments(estimate_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_user_time ON activity_log(user_id, created_at DESC);
```

### 2. Data Access Layer

**Repository Pattern Implementation:**
```javascript
class ProjectRepository {
  constructor(db) {
    this.db = db;
  }

  async create(projectData, userId) {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert project
      const projectResult = await client.query(
        `INSERT INTO projects (company_id, name, metadata, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [projectData.companyId, projectData.name, projectData.metadata, userId]
      );
      
      const project = projectResult.rows[0];
      
      // Log activity
      await this.logActivity(client, {
        userId,
        action: 'project_created',
        entityType: 'project',
        entityId: project.id,
        changes: { created: projectData }
      });
      
      await client.query('COMMIT');
      return project;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findWithEstimates(projectId, includeDeleted = false) {
    const query = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', e.id,
            'version', e.version,
            'status', e.status,
            'final_bid', e.final_bid,
            'target_margin', e.target_margin,
            'created_at', e.created_at,
            'risk_count', (
              SELECT COUNT(*) 
              FROM risk_assessments ra 
              WHERE ra.estimate_id = e.id
            )
          ) ORDER BY e.version DESC
        ) as estimates
      FROM projects p
      LEFT JOIN estimates e ON p.id = e.project_id
      WHERE p.id = $1
        ${includeDeleted ? '' : 'AND p.deleted_at IS NULL'}
      GROUP BY p.id
    `;
    
    const result = await this.db.query(query, [projectId]);
    return result.rows[0];
  }

  async updateWithVersioning(projectId, updates, userId) {
    // Preserve history while updating
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get current state for comparison
      const currentState = await this.findById(projectId);
      
      // Update project
      const updateResult = await client.query(
        `UPDATE projects 
         SET name = COALESCE($1, name),
             metadata = COALESCE($2, metadata),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [updates.name, updates.metadata, projectId]
      );
      
      // Log changes
      const changes = this.calculateChanges(currentState, updateResult.rows[0]);
      if (Object.keys(changes).length > 0) {
        await this.logActivity(client, {
          userId,
          action: 'project_updated',
          entityType: 'project',
          entityId: projectId,
          changes
        });
      }
      
      await client.query('COMMIT');
      return updateResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

class EstimateRepository {
  async createVersion(estimateData, userId) {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get next version number
      const versionResult = await client.query(
        `SELECT COALESCE(MAX(version), 0) + 1 as next_version
         FROM estimates
         WHERE project_id = $1`,
        [estimateData.projectId]
      );
      
      const version = versionResult.rows[0].next_version;
      
      // Create new version
      const estimateResult = await client.query(
        `INSERT INTO estimates (
           project_id, version, status, base_cost, 
           total_risk_adjustment, final_bid, target_margin,
           cost_breakdown, risk_analysis, created_by,
           parent_version_id, version_notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          estimateData.projectId,
          version,
          estimateData.status || 'draft',
          estimateData.baseCost,
          estimateData.totalRiskAdjustment,
          estimateData.finalBid,
          estimateData.targetMargin,
          estimateData.costBreakdown,
          estimateData.riskAnalysis,
          userId,
          estimateData.parentVersionId,
          estimateData.versionNotes
        ]
      );
      
      const estimate = estimateResult.rows[0];
      
      // Copy risk assessments if this is a new version
      if (estimateData.parentVersionId) {
        await this.copyRiskAssessments(
          client, 
          estimateData.parentVersionId, 
          estimate.id
        );
      }
      
      await client.query('COMMIT');
      return estimate;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async saveProgress(estimateId, updates) {
    // Auto-save functionality
    const result = await this.db.query(
      `UPDATE estimates
       SET cost_breakdown = COALESCE($1, cost_breakdown),
           risk_analysis = COALESCE($2, risk_analysis),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING updated_at`,
      [updates.costBreakdown, updates.riskAnalysis, estimateId]
    );
    
    return result.rows[0];
  }
}
```

### 3. Real-Time Sync System

**WebSocket Sync Implementation:**
```javascript
class DataSyncService {
  constructor(wsServer, repositories) {
    this.wsServer = wsServer;
    this.repositories = repositories;
    this.syncQueues = new Map(); // userId -> pending changes
    this.activeSessions = new Map(); // userId -> websocket connections
  }

  async handleConnection(ws, userId) {
    // Register connection
    if (!this.activeSessions.has(userId)) {
      this.activeSessions.set(userId, new Set());
    }
    this.activeSessions.get(userId).add(ws);
    
    // Send any pending changes
    await this.sendPendingChanges(ws, userId);
    
    // Handle incoming messages
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      await this.handleSyncMessage(ws, userId, data);
    });
    
    // Cleanup on disconnect
    ws.on('close', () => {
      const userSessions = this.activeSessions.get(userId);
      if (userSessions) {
        userSessions.delete(ws);
        if (userSessions.size === 0) {
          this.activeSessions.delete(userId);
        }
      }
    });
  }

  async handleSyncMessage(ws, userId, data) {
    switch (data.type) {
      case 'estimate_update':
        await this.syncEstimateUpdate(userId, data.payload);
        break;
        
      case 'risk_assessment':
        await this.syncRiskAssessment(userId, data.payload);
        break;
        
      case 'auto_save':
        await this.handleAutoSave(userId, data.payload);
        break;
        
      case 'conflict_resolution':
        await this.resolveConflict(userId, data.payload);
        break;
    }
  }

  async syncEstimateUpdate(userId, payload) {
    // Validate user has access
    const hasAccess = await this.validateAccess(userId, payload.estimateId);
    if (!hasAccess) return;
    
    // Apply update
    const updated = await this.repositories.estimates.saveProgress(
      payload.estimateId,
      payload.updates
    );
    
    // Broadcast to other sessions
    this.broadcastToUser(userId, {
      type: 'estimate_updated',
      payload: {
        estimateId: payload.estimateId,
        updates: payload.updates,
        timestamp: updated.updated_at
      }
    }, payload.sessionId);
  }

  broadcastToUser(userId, message, excludeSessionId = null) {
    const userSessions = this.activeSessions.get(userId);
    if (!userSessions) return;
    
    const messageStr = JSON.stringify(message);
    userSessions.forEach(ws => {
      if (ws.sessionId !== excludeSessionId && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}
```

### 4. Offline Support

**Service Worker for Offline Capability:**
```javascript
// sw.js - Service Worker
const CACHE_NAME = 'myroofgenius-v1';
const OFFLINE_API_CACHE = 'api-cache-v1';

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/offline.html'
      ]);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    // Handle non-GET requests (queue for sync)
    if (!navigator.onLine) {
      event.respondWith(handleOfflineRequest(event.request));
    }
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch new
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache API responses
        if (event.request.url.includes('/api/')) {
          return caches.open(OFFLINE_API_CACHE).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});

// Background sync for offline changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-estimates') {
    event.waitUntil(syncOfflineEstimates());
  }
});

async function syncOfflineEstimates() {
  const db = await openIndexedDB();
  const pendingChanges = await db.getAllPendingChanges();
  
  for (const change of pendingChanges) {
    try {
      const response = await fetch(change.url, {
        method: change.method,
        headers: change.headers,
        body: JSON.stringify(change.data)
      });
      
      if (response.ok) {
        await db.removePendingChange(change.id);
      }
    } catch (error) {
      console.error('Sync failed for change:', change.id);
    }
  }
}
```

### 5. Data Export and Backup

**Export Service Implementation:**
```javascript
class DataExportService {
  async exportProjectData(projectId, format = 'json') {
    // Gather all project data
    const project = await this.repositories.projects.findWithEstimates(projectId);
    const estimates = await this.repositories.estimates.findByProject(projectId);
    const risks = await this.repositories.risks.findByProject(projectId);
    const actuals = await this.repositories.actuals.findByProject(projectId);
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      project,
      estimates,
      risks,
      actuals,
      metadata: {
        totalEstimates: estimates.length,
        totalRisks: risks.length,
        hasActuals: actuals.length > 0
      }
    };
    
    switch (format) {
      case 'json':
        return this.exportAsJSON(exportData);
      case 'excel':
        return this.exportAsExcel(exportData);
      case 'pdf':
        return this.exportAsPDF(exportData);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async createBackup(companyId) {
    // Create complete company backup
    const backupData = {
      version: '1.0',
      backupDate: new Date().toISOString(),
      company: await this.repositories.companies.findById(companyId),
      users: await this.repositories.users.findByCompany(companyId),
      projects: await this.repositories.projects.findByCompany(companyId),
      estimates: await this.repositories.estimates.findByCompany(companyId),
      risks: await this.repositories.risks.findByCompany(companyId)
    };
    
    // Encrypt sensitive data
    const encrypted = await this.encryptBackup(backupData);
    
    // Store in secure location
    const backupUrl = await this.storeBackup(encrypted, companyId);
    
    return {
      backupId: generateBackupId(),
      url: backupUrl,
      size: encrypted.length,
      createdAt: new Date().toISOString()
    };
  }
}
```

## Design & UX Specifications

**Data State Indicators:**
```css
/* Sync status indicators */
.sync-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #718096;
}

.sync-status.syncing {
  color: #3E92CC;
}

.sync-status.syncing::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3E92CC;
  margin-right: 6px;
  animation: pulse 1.5s infinite;
}

.sync-status.offline {
  color: #F6AD55;
}

.sync-status.error {
  color: #E53E3E;
}

/* Auto-save indicator */
.auto-save {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #2D3748;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.auto-save.active {
  opacity: 1;
  transform: translateY(0);
}

/* Version history */
.version-item {
  padding: 12px;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.version-item.current {
  border-left-color: #48BB78;
  background: #F0FFF4;
}

.version-item:hover {
  background: #F7FAFC;
}
```

## Acceptance Criteria

### Data Integrity
- [ ] All saves complete within 1 second
- [ ] Version history maintained accurately
- [ ] No data loss on connection interruption
- [ ] Audit trail captures all changes

### Sync Functionality
- [ ] Real-time sync across devices
- [ ] Conflict resolution works correctly
- [ ] Offline changes sync when reconnected
- [ ] No duplicate data creation

### Performance
- [ ] Dashboard loads in < 2s with 1000+ records
- [ ] Search returns results in < 500ms
- [ ] Export completes in < 5s for large projects
- [ ] No memory leaks in long sessions

### Security
- [ ] Row-level security enforced
- [ ] API endpoints authenticated
- [ ] Sensitive data encrypted at rest
- [ ] Backups encrypted and secure

## Operator QA Checklist

### Data Persistence Testing
1. Create estimate, force quit browser, verify recovery
2. Work offline for 30 minutes, verify sync on reconnect
3. Edit same estimate on two devices, verify conflict handling
4. Delete and restore project, verify soft delete
5. Export and reimport data, verify completeness

### Performance Testing
1. Load dashboard with 5000 projects
2. Search across 10000 estimates
3. Generate 50MB export file
4. Test with throttled network (3G)
5. Monitor memory usage over 24 hours

### Security Testing
1. Attempt to access other company's data
2. Test API without authentication
3. Verify encrypted fields in database
4. Test SQL injection on search
5. Verify secure backup storage

### Sync Testing
1. Make changes on 3 devices simultaneously
2. Work offline, make conflicting changes
3. Test auto-save during network interruption
4. Verify WebSocket reconnection
5. Test with 10 concurrent users

## Assigned AI

**Primary:** Codex - Database implementation and sync logic  
**Secondary:** Operator - Testing data integrity and sync  
**Review:** Claude - Documentation and error messages