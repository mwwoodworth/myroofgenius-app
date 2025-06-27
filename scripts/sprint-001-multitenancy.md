# Sprint 001: Multi-Tenancy Foundation

## Executive Context

**Why This Matters**: Multi-tenancy is the foundational architecture that enables MyRoofGenius to serve multiple roofing contractors, estimators, and construction firms from a single deployment while maintaining complete data isolation, security, and performance. This sprint establishes the core tenant isolation patterns that every subsequent feature will build upon.

**What This Protects**: 
- Data sovereignty for each customer
- Performance isolation preventing noisy neighbor effects
- Compliance boundaries for regulated data
- Cost-effective scaling without infrastructure duplication

## Implementation Steps

### 1. Database Schema Updates

```sql
-- Add tenant_id to all existing tables
ALTER TABLE users ADD COLUMN tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE projects ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE estimates ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE materials ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE labor_rates ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE documents ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE audit_logs ADD COLUMN tenant_id UUID NOT NULL;

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant_users junction table
CREATE TABLE tenant_users (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_estimates_tenant_id ON estimates(tenant_id);
CREATE INDEX idx_materials_tenant_id ON materials(tenant_id);
CREATE INDEX idx_labor_rates_tenant_id ON labor_rates(tenant_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);

-- Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_users ON users
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_projects ON projects
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_estimates ON estimates
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_materials ON materials
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_labor_rates ON labor_rates
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_documents ON documents
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 2. API Middleware Implementation

```typescript
// middleware/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';

interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
}

export class TenantMiddleware {
  static async validateTenant(
    req: TenantRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract tenant from subdomain or header
      const subdomain = req.hostname.split('.')[0];
      const headerTenant = req.headers['x-tenant-id'] as string;
      
      // For API calls, prioritize header
      const tenantIdentifier = headerTenant || subdomain;
      
      if (!tenantIdentifier || tenantIdentifier === 'www') {
        return res.status(400).json({
          error: 'Tenant identification required'
        });
      }

      // Validate tenant exists and is active
      const tenant = await db.query(
        'SELECT id, status FROM tenants WHERE slug = $1 OR id = $1',
        [tenantIdentifier]
      );

      if (!tenant.rows[0]) {
        return res.status(404).json({
          error: 'Tenant not found'
        });
      }

      if (tenant.rows[0].status !== 'active') {
        return res.status(403).json({
          error: 'Tenant account suspended'
        });
      }

      // Set tenant context for RLS
      await db.query('SET LOCAL app.current_tenant TO $1', [tenant.rows[0].id]);
      
      req.tenantId = tenant.rows[0].id;
      next();
    } catch (error) {
      console.error('Tenant validation error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  static async validateUserTenantAccess(
    req: TenantRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.userId = decoded.userId;

      // Verify user has access to tenant
      const access = await db.query(
        `SELECT role, permissions 
         FROM tenant_users 
         WHERE tenant_id = $1 AND user_id = $2`,
        [req.tenantId, req.userId]
      );

      if (!access.rows[0]) {
        return res.status(403).json({
          error: 'Access denied to this tenant'
        });
      }

      req.role = access.rows[0].role;
      req.permissions = access.rows[0].permissions;
      
      next();
    } catch (error) {
      console.error('User tenant access error:', error);
      res.status(401).json({
        error: 'Invalid authentication'
      });
    }
  }
}
```

### 3. Tenant Context Service

```typescript
// services/tenant-context.service.ts
import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
  tenantId: string;
  userId?: string;
  role?: string;
  permissions?: string[];
}

export class TenantContextService {
  private static storage = new AsyncLocalStorage<TenantContext>();

  static run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static get(): TenantContext | undefined {
    return this.storage.getStore();
  }

  static getTenantId(): string {
    const context = this.get();
    if (!context?.tenantId) {
      throw new Error('Tenant context not established');
    }
    return context.tenantId;
  }

  static getUserId(): string | undefined {
    return this.get()?.userId;
  }

  static hasPermission(permission: string): boolean {
    const context = this.get();
    return context?.permissions?.includes(permission) || false;
  }
}
```

### 4. Repository Pattern Updates

```typescript
// repositories/base.repository.ts
import { TenantContextService } from '../services/tenant-context.service';
import { db } from '../database';

export abstract class BaseRepository<T> {
  protected abstract tableName: string;

  protected async query(sql: string, params: any[] = []): Promise<any> {
    const tenantId = TenantContextService.getTenantId();
    
    // Inject tenant_id into queries automatically
    const tenantSql = sql.includes('WHERE') 
      ? sql.replace('WHERE', `WHERE tenant_id = '${tenantId}' AND`)
      : sql.includes('RETURNING') 
      ? sql.replace('RETURNING', `WHERE tenant_id = '${tenantId}' RETURNING`)
      : sql;

    return db.query(tenantSql, params);
  }

  async findAll(conditions: Partial<T> = {}): Promise<T[]> {
    const tenantId = TenantContextService.getTenantId();
    const whereClause = Object.entries({ tenant_id: tenantId, ...conditions })
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const values = Object.values({ tenant_id: tenantId, ...conditions });
    
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
    
    return result.rows;
  }

  async findById(id: string): Promise<T | null> {
    const tenantId = TenantContextService.getTenantId();
    
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    
    return result.rows[0] || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const tenantId = TenantContextService.getTenantId();
    const dataWithTenant = { ...data, tenant_id: tenantId };
    
    const columns = Object.keys(dataWithTenant).join(', ');
    const placeholders = Object.keys(dataWithTenant)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(dataWithTenant);
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const tenantId = TenantContextService.getTenantId();
    
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(data), tenantId];
    
    const result = await db.query(
      `UPDATE ${this.tableName} 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND tenant_id = $${values.length}
       RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const tenantId = TenantContextService.getTenantId();
    
    const result = await db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    
    return result.rowCount > 0;
  }
}
```

### 5. Vector Store Tenant Isolation

```typescript
// services/vector-store.service.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { TenantContextService } from './tenant-context.service';

export class VectorStoreService {
  private pinecone: Pinecone;
  
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!
    });
  }

  async upsertVector(
    indexName: string,
    id: string,
    values: number[],
    metadata: Record<string, any>
  ): Promise<void> {
    const tenantId = TenantContextService.getTenantId();
    const index = this.pinecone.index(indexName);
    
    await index.upsert([{
      id: `${tenantId}:${id}`,
      values,
      metadata: {
        ...metadata,
        tenant_id: tenantId
      }
    }]);
  }

  async query(
    indexName: string,
    vector: number[],
    topK: number = 10
  ): Promise<any> {
    const tenantId = TenantContextService.getTenantId();
    const index = this.pinecone.index(indexName);
    
    const results = await index.query({
      vector,
      topK,
      filter: {
        tenant_id: { $eq: tenantId }
      },
      includeMetadata: true
    });
    
    return results.matches;
  }

  async deleteByTenant(indexName: string): Promise<void> {
    const tenantId = TenantContextService.getTenantId();
    const index = this.pinecone.index(indexName);
    
    await index.deleteMany({
      tenant_id: { $eq: tenantId }
    });
  }
}
```

### 6. S3 Tenant Partitioning

```typescript
// services/storage.service.ts
import AWS from 'aws-sdk';
import { TenantContextService } from './tenant-context.service';

export class StorageService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  private getTenantPrefix(): string {
    const tenantId = TenantContextService.getTenantId();
    return `tenants/${tenantId}`;
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const tenantPrefix = this.getTenantPrefix();
    const fullKey = `${tenantPrefix}/${key}`;

    return this.s3.upload({
      Bucket: this.bucketName,
      Key: fullKey,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        tenantId: TenantContextService.getTenantId()
      }
    }).promise();
  }

  async getFile(key: string): Promise<AWS.S3.GetObjectOutput> {
    const tenantPrefix = this.getTenantPrefix();
    const fullKey = `${tenantPrefix}/${key}`;

    return this.s3.getObject({
      Bucket: this.bucketName,
      Key: fullKey
    }).promise();
  }

  async deleteFile(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    const tenantPrefix = this.getTenantPrefix();
    const fullKey = `${tenantPrefix}/${key}`;

    return this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: fullKey
    }).promise();
  }

  async listFiles(prefix: string = ''): Promise<AWS.S3.ObjectList> {
    const tenantPrefix = this.getTenantPrefix();
    const fullPrefix = `${tenantPrefix}/${prefix}`;

    const response = await this.s3.listObjectsV2({
      Bucket: this.bucketName,
      Prefix: fullPrefix
    }).promise();

    return response.Contents || [];
  }
}
```

### 7. Frontend Tenant Context

```typescript
// frontend/contexts/TenantContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tenant from subdomain or stored preference
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      if (subdomain === 'www' || subdomain === 'localhost') {
        // Load from user's default tenant
        const response = await api.get('/auth/current-tenant');
        setTenant(response.data.tenant);
      } else {
        // Load from subdomain
        const response = await api.get(`/tenants/by-slug/${subdomain}`);
        setTenant(response.data);
      }

      // Set tenant header for all API calls
      api.defaults.headers.common['X-Tenant-Id'] = tenant?.id;
    } catch (err) {
      setError('Failed to load tenant information');
      console.error('Tenant load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/switch-tenant', { tenantId });
      setTenant(response.data.tenant);
      
      // Update API headers
      api.defaults.headers.common['X-Tenant-Id'] = tenantId;
      
      // Redirect to tenant subdomain
      if (response.data.tenant.slug) {
        window.location.href = `https://${response.data.tenant.slug}.${process.env.NEXT_PUBLIC_DOMAIN}`;
      }
    } catch (err) {
      setError('Failed to switch tenant');
      console.error('Tenant switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, loading, error, switchTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
```

### 8. Migration Scripts

```typescript
// migrations/001_add_multitenancy.ts
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create default tenant for existing data
  pgm.sql(`
    INSERT INTO tenants (id, name, slug, status)
    VALUES ('00000000-0000-0000-0000-000000000000', 'Default Tenant', 'default', 'active')
    ON CONFLICT DO NOTHING;
  `);

  // Assign all existing data to default tenant
  const tables = ['users', 'projects', 'estimates', 'materials', 'labor_rates', 'documents', 'audit_logs'];
  
  for (const table of tables) {
    pgm.sql(`
      UPDATE ${table} 
      SET tenant_id = '00000000-0000-0000-0000-000000000000'
      WHERE tenant_id IS NULL;
    `);
  }

  // Create tenant_users entries for existing users
  pgm.sql(`
    INSERT INTO tenant_users (tenant_id, user_id, role)
    SELECT '00000000-0000-0000-0000-000000000000', id, 'admin'
    FROM users
    WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
    ON CONFLICT DO NOTHING;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Remove tenant columns
  const tables = ['users', 'projects', 'estimates', 'materials', 'labor_rates', 'documents', 'audit_logs'];
  
  for (const table of tables) {
    pgm.dropColumn(table, 'tenant_id');
  }

  pgm.dropTable('tenant_users');
  pgm.dropTable('tenants');
}
```

## Test Procedures

### Unit Tests

```typescript
// tests/unit/tenant-context.test.ts
import { TenantContextService } from '../../services/tenant-context.service';

describe('TenantContextService', () => {
  it('should store and retrieve tenant context', () => {
    const context = {
      tenantId: 'test-tenant-id',
      userId: 'test-user-id',
      role: 'admin',
      permissions: ['read', 'write']
    };

    TenantContextService.run(context, () => {
      expect(TenantContextService.getTenantId()).toBe('test-tenant-id');
      expect(TenantContextService.getUserId()).toBe('test-user-id');
      expect(TenantContextService.hasPermission('read')).toBe(true);
      expect(TenantContextService.hasPermission('delete')).toBe(false);
    });
  });

  it('should throw error when tenant context not established', () => {
    expect(() => TenantContextService.getTenantId()).toThrow(
      'Tenant context not established'
    );
  });
});
```

### Integration Tests

```typescript
// tests/integration/multitenancy.test.ts
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../database';

describe('Multi-tenancy Integration', () => {
  let tenant1Token: string;
  let tenant2Token: string;
  let tenant1Id: string;
  let tenant2Id: string;

  beforeAll(async () => {
    // Create test tenants
    const tenant1 = await db.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
      ['Tenant 1', 'tenant1']
    );
    tenant1Id = tenant1.rows[0].id;

    const tenant2 = await db.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
      ['Tenant 2', 'tenant2']
    );
    tenant2Id = tenant2.rows[0].id;

    // Create test users and get tokens
    // ... authentication setup
  });

  it('should isolate data between tenants', async () => {
    // Create project in tenant 1
    const project1 = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .set('X-Tenant-Id', tenant1Id)
      .send({ name: 'Tenant 1 Project' })
      .expect(201);

    // Try to access from tenant 2
    await request(app)
      .get(`/api/projects/${project1.body.id}`)
      .set('Authorization', `Bearer ${tenant2Token}`)
      .set('X-Tenant-Id', tenant2Id)
      .expect(404);

    // Access from correct tenant
    await request(app)
      .get(`/api/projects/${project1.body.id}`)
      .set('Authorization', `Bearer ${tenant1Token}`)
      .set('X-Tenant-Id', tenant1Id)
      .expect(200);
  });

  it('should filter list queries by tenant', async () => {
    // Create projects in different tenants
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .set('X-Tenant-Id', tenant1Id)
      .send({ name: 'Tenant 1 Project' })
      .expect(201);

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tenant2Token}`)
      .set('X-Tenant-Id', tenant2Id)
      .send({ name: 'Tenant 2 Project' })
      .expect(201);

    // List projects for tenant 1
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .set('X-Tenant-Id', tenant1Id)
      .expect(200);

    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].name).toBe('Tenant 1 Project');
  });
});
```

### Edge Case Tests

```typescript
// tests/edge-cases/tenant-security.test.ts
describe('Tenant Security Edge Cases', () => {
  it('should prevent SQL injection in tenant queries', async () => {
    const maliciousTenantId = "'; DROP TABLE users; --";
    
    await request(app)
      .get('/api/projects')
      .set('X-Tenant-Id', maliciousTenantId)
      .expect(404); // Tenant not found, not SQL error

    // Verify table still exists
    const tableExists = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )`
    );
    expect(tableExists.rows[0].exists).toBe(true);
  });

  it('should handle tenant switching race conditions', async () => {
    // Simulate rapid tenant switching
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .get('/api/projects')
          .set('Authorization', `Bearer ${i % 2 === 0 ? tenant1Token : tenant2Token}`)
          .set('X-Tenant-Id', i % 2 === 0 ? tenant1Id : tenant2Id)
      );
    }

    const results = await Promise.all(promises);
    
    // Verify no data leakage
    results.forEach((result, index) => {
      if (index % 2 === 0) {
        expect(result.body.projects.every(p => p.tenant_id === tenant1Id)).toBe(true);
      } else {
        expect(result.body.projects.every(p => p.tenant_id === tenant2Id)).toBe(true);
      }
    });
  });
});
```

## Rollback Procedures

```bash
#!/bin/bash
# rollback-multitenancy.sh

echo "Starting multi-tenancy rollback..."

# 1. Disable RLS policies
psql $DATABASE_URL << EOF
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_projects ON projects;
DROP POLICY IF EXISTS tenant_isolation_estimates ON estimates;
DROP POLICY IF EXISTS tenant_isolation_materials ON materials;
DROP POLICY IF EXISTS tenant_isolation_labor_rates ON labor_rates;
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
EOF

# 2. Deploy previous API version without tenant middleware
kubectl set image deployment/api api=myroofgenius/api:pre-multitenancy

# 3. Run data consolidation (if needed)
psql $DATABASE_URL << EOF
-- Move all data to default tenant before removing columns
UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000000';
UPDATE projects SET tenant_id = '00000000-0000-0000-0000-000000000000';
UPDATE estimates SET tenant_id = '00000000-0000-0000-0000-000000000000';
UPDATE materials SET tenant_id = '00000000-0000-0000-0000-000000000000';
UPDATE labor_rates SET tenant_id = '00000000-0000-0000-0000-000000000000';
UPDATE documents SET tenant_id = '00000000-0000-0000-0000-000000000000';
EOF

echo "Rollback completed. Monitor application for issues."
```

## Commit Messages

```
feat(core): implement multi-tenancy foundation

- Add tenant_id columns to all primary tables
- Implement Row Level Security policies for data isolation  
- Create tenant-aware middleware and context service
- Update repositories with automatic tenant filtering
- Add tenant partitioning for vector store and S3
- Implement frontend tenant context and switching
- Add comprehensive test coverage for isolation

BREAKING CHANGE: All API endpoints now require tenant context
```

## Completion Checklist

- [ ] Database schema updated with tenant_id columns
- [ ] RLS policies created and tested
- [ ] API middleware validates tenant context
- [ ] TenantContextService implemented
- [ ] All repositories updated with tenant filtering
- [ ] Vector store queries filtered by tenant
- [ ] S3 storage partitioned by tenant
- [ ] Frontend context provider implemented
- [ ] Migration scripts tested on staging
- [ ] Unit tests passing (100% coverage on critical paths)
- [ ] Integration tests verify data isolation
- [ ] Edge case tests for security vulnerabilities
- [ ] Performance benchmarks show <5% overhead
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Security review completed

## Post-Sprint Acceptance Criteria

1. **Data Isolation**: No data leakage between tenants in any API endpoint
2. **Performance**: Query performance degradation < 5% with tenant filtering
3. **Security**: All OWASP multi-tenancy guidelines implemented
4. **Scalability**: System supports 1000+ tenants without architectural changes
5. **Migration**: Existing data successfully migrated to default tenant
6. **User Experience**: Tenant switching works seamlessly
7. **Monitoring**: Tenant-specific metrics and alerts configured