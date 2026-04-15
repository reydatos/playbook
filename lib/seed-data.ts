import { Playbook } from "./types";
import { generateId } from "./utils";

const SEED_USER_ID = "seed-admin";

export function getSeedPlaybooks(): Playbook[] {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const lastWeek = new Date(Date.now() - 604800000).toISOString();

  return [
    {
      id: generateId(),
      title: "Kubernetes Incident Response Runbook",
      description:
        "Step-by-step procedures for responding to Kubernetes cluster incidents including pod failures, node issues, and resource exhaustion.",
      content: `# Kubernetes Incident Response Runbook

## Overview

This runbook provides structured procedures for responding to common Kubernetes cluster incidents. Follow these steps in order to diagnose and resolve issues efficiently.

## Prerequisites

- \`kubectl\` CLI installed and configured
- Cluster admin access or equivalent RBAC permissions
- Access to monitoring dashboards (Grafana/Datadog)
- PagerDuty escalation policy configured

## 1. Initial Assessment

### Check Cluster Health

\`\`\`bash
# Get overall cluster status
kubectl cluster-info

# Check node status
kubectl get nodes -o wide

# Check for pods in error states
kubectl get pods --all-namespaces --field-selector=status.phase!=Running,status.phase!=Succeeded
\`\`\`

### Check Resource Usage

\`\`\`bash
# Node resource utilization
kubectl top nodes

# Pod resource utilization (sorted by CPU)
kubectl top pods --all-namespaces --sort-by=cpu
\`\`\`

## 2. Common Incident Types

### Pod CrashLoopBackOff

1. Identify the failing pod:
\`\`\`bash
kubectl get pods -n <namespace> | grep CrashLoopBackOff
\`\`\`

2. Check pod logs:
\`\`\`bash
kubectl logs <pod-name> -n <namespace> --previous
\`\`\`

3. Describe the pod for events:
\`\`\`bash
kubectl describe pod <pod-name> -n <namespace>
\`\`\`

4. Common causes:
   - Application configuration errors
   - Missing environment variables or secrets
   - Resource limits too low (OOMKilled)
   - Liveness probe failures

### Node NotReady

1. Identify affected nodes:
\`\`\`bash
kubectl get nodes | grep NotReady
\`\`\`

2. Check node conditions:
\`\`\`bash
kubectl describe node <node-name> | grep -A 20 "Conditions:"
\`\`\`

3. SSH into the node and check kubelet:
\`\`\`bash
systemctl status kubelet
journalctl -u kubelet --since "10 minutes ago"
\`\`\`

### Resource Exhaustion

| Resource | Warning Threshold | Critical Threshold | Action |
|----------|------------------|--------------------|---------|
| CPU | 70% | 90% | Scale horizontally or vertically |
| Memory | 75% | 90% | Check for memory leaks, increase limits |
| Disk | 80% | 95% | Clean up logs, expand PVCs |
| Pods | 80% of max | 95% of max | Increase node count |

## 3. Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|--------------|-----------------|
| P1 - Critical | 5 minutes | On-call SRE -> SRE Lead -> VP Engineering |
| P2 - High | 15 minutes | On-call SRE -> SRE Lead |
| P3 - Medium | 1 hour | On-call SRE |
| P4 - Low | Next business day | Ticket queue |

## 4. Post-Incident

- [ ] Create incident timeline document
- [ ] Conduct blameless post-mortem within 48 hours
- [ ] Update runbook with any new findings
- [ ] Create Jira tickets for follow-up actions
`,
      category: "Incident Response",
      tags: ["kubernetes", "incident-response", "SRE", "infrastructure"],
      status: "published",
      createdAt: lastWeek,
      updatedAt: yesterday,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versions: [],
    },
    {
      id: generateId(),
      title: "REST API Integration Guide",
      description:
        "Complete guide for integrating with our REST API including authentication, endpoints, rate limits, and error handling.",
      content: `# REST API Integration Guide

## Getting Started

This guide walks through integrating with our REST API. By the end, you'll be able to authenticate, make requests, and handle responses correctly.

## Authentication

All API requests require Bearer token authentication.

### Obtaining an API Key

1. Navigate to **Settings > API Keys** in the dashboard
2. Click **Generate New Key**
3. Select the appropriate scopes
4. Copy and securely store the key (it won't be shown again)

### Using the API Key

\`\`\`bash
curl -X GET https://api.example.com/v2/resources \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"
\`\`\`

### SDK Example (Python)

\`\`\`python
import requests

class APIClient:
    BASE_URL = "https://api.example.com/v2"

    def __init__(self, api_key: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    def get_resources(self, page: int = 1, limit: int = 50):
        """Fetch paginated resources."""
        response = self.session.get(
            f"{self.BASE_URL}/resources",
            params={"page": page, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    def create_resource(self, data: dict):
        """Create a new resource."""
        response = self.session.post(
            f"{self.BASE_URL}/resources",
            json=data
        )
        response.raise_for_status()
        return response.json()
\`\`\`

## Rate Limits

| Plan | Requests/min | Requests/day | Burst |
|------|-------------|-------------|-------|
| Free | 60 | 10,000 | 10 |
| Pro | 300 | 100,000 | 50 |
| Enterprise | 1,000 | Unlimited | 200 |

Rate limit headers are included in every response:

\`\`\`
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 297
X-RateLimit-Reset: 1704067200
\`\`\`

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The 'email' field must be a valid email address",
    "details": [
      {
        "field": "email",
        "constraint": "format",
        "value": "not-an-email"
      }
    ]
  }
}
\`\`\`

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid API key |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource does not exist |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error - retry with backoff |

## Webhooks

Configure webhooks to receive real-time notifications:

\`\`\`json
{
  "url": "https://your-server.com/webhooks",
  "events": ["resource.created", "resource.updated", "resource.deleted"],
  "secret": "whsec_your_webhook_secret"
}
\`\`\`

### Verifying Webhook Signatures

\`\`\`python
import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
\`\`\`
`,
      category: "API Integration",
      tags: ["API", "REST", "integration", "authentication"],
      status: "published",
      createdAt: lastWeek,
      updatedAt: lastWeek,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versions: [],
    },
    {
      id: generateId(),
      title: "PostgreSQL Database Migration Runbook",
      description:
        "Procedures for safely executing database migrations including pre-checks, rollback plans, and performance validation.",
      content: `# PostgreSQL Database Migration Runbook

## Purpose

This runbook outlines the process for executing schema migrations on production PostgreSQL databases with zero downtime.

## Pre-Migration Checklist

- [ ] Migration SQL reviewed and approved by DBA
- [ ] Rollback script prepared and tested on staging
- [ ] Backup completed and verified
- [ ] Maintenance window scheduled (if needed)
- [ ] Stakeholders notified
- [ ] Monitoring dashboards open

## 1. Pre-Flight Checks

### Verify Database State

\`\`\`sql
-- Check active connections
SELECT count(*) as active_connections,
       state,
       wait_event_type
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, wait_event_type;

-- Check for long-running transactions
SELECT pid,
       now() - xact_start as duration,
       query,
       state
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
  AND state != 'idle'
ORDER BY duration DESC
LIMIT 10;

-- Check replication lag
SELECT client_addr,
       state,
       sent_lsn,
       write_lsn,
       flush_lsn,
       replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag
FROM pg_stat_replication;
\`\`\`

### Estimate Migration Impact

\`\`\`sql
-- Table size and row count
SELECT schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
       n_live_tup as row_count
FROM pg_stat_user_tables
WHERE tablename = 'your_table'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
\`\`\`

## 2. Safe Migration Patterns

### Adding a Column (Zero Downtime)

\`\`\`sql
-- Step 1: Add column with NULL default (instant, no lock)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Step 2: Backfill in batches (avoid long transactions)
DO $$
DECLARE
    batch_size INT := 10000;
    total_updated INT := 0;
    rows_affected INT;
BEGIN
    LOOP
        UPDATE users
        SET phone = 'N/A'
        WHERE phone IS NULL
          AND id IN (
            SELECT id FROM users
            WHERE phone IS NULL
            LIMIT batch_size
          );

        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        total_updated := total_updated + rows_affected;
        RAISE NOTICE 'Updated % rows (total: %)', rows_affected, total_updated;

        EXIT WHEN rows_affected = 0;
        PERFORM pg_sleep(0.1);  -- Brief pause between batches
    END LOOP;
END $$;

-- Step 3: Add NOT NULL constraint (after backfill complete)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
\`\`\`

### Adding an Index (Concurrently)

\`\`\`sql
-- Always use CONCURRENTLY to avoid blocking writes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Verify index is valid
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users' AND indexname = 'idx_users_email';
\`\`\`

## 3. Rollback Procedures

### Quick Rollback Checklist

1. Stop the migration if still running
2. Execute the rollback script
3. Verify application health
4. Notify stakeholders

### Rollback Script Template

\`\`\`sql
BEGIN;

-- Undo your changes here
ALTER TABLE users DROP COLUMN IF EXISTS phone;
DROP INDEX IF EXISTS idx_users_email;

COMMIT;
\`\`\`

## 4. Post-Migration Validation

\`\`\`sql
-- Verify schema change applied
\\d+ your_table

-- Check query performance hasn't degraded
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'test@example.com';

-- Monitor for errors in application logs
-- Watch pg_stat_activity for slow queries
\`\`\`
`,
      category: "Database Operations",
      tags: ["PostgreSQL", "database", "migration", "DBA"],
      status: "published",
      createdAt: lastWeek,
      updatedAt: now,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versions: [],
    },
    {
      id: generateId(),
      title: "New Customer Onboarding Checklist",
      description:
        "Standard onboarding procedures for new enterprise customers including environment setup, access provisioning, and training.",
      content: `# New Customer Onboarding Checklist

## Overview

This playbook covers the complete onboarding flow for new enterprise customers from contract signing through go-live.

## Phase 1: Account Setup (Days 1-3)

### 1.1 Provisioning

- [ ] Create customer organization in admin portal
- [ ] Set up dedicated tenant/namespace
- [ ] Configure SSO/SAML integration
- [ ] Provision admin user accounts
- [ ] Generate API keys for integration

### 1.2 Environment Configuration

\`\`\`yaml
# customer-config.yaml
organization:
  name: "Acme Corp"
  plan: enterprise
  region: us-east-1

features:
  sso: true
  audit_logging: true
  custom_domains: true
  data_retention_days: 365

limits:
  max_users: 500
  max_api_calls_per_day: 1000000
  storage_gb: 100
\`\`\`

### 1.3 Network Configuration

| Service | Protocol | Port | Source |
|---------|----------|------|--------|
| API Gateway | HTTPS | 443 | Customer VPN |
| Webhooks | HTTPS | 443 | Our IPs |
| SFTP | SSH | 22 | Customer IPs |
| Database (if applicable) | TCP | 5432 | VPC Peering |

## Phase 2: Integration (Days 4-10)

### 2.1 Data Migration

1. Receive data export from customer's current system
2. Validate data format and completeness
3. Run transformation scripts
4. Import into staging environment
5. Customer validates migrated data
6. Schedule production import

### 2.2 API Integration Testing

\`\`\`bash
# Health check
curl -s https://api.example.com/health | jq .

# Test authentication
curl -s -H "Authorization: Bearer $API_KEY" \\
  https://api.example.com/v2/me | jq .

# Test core endpoints
curl -s -H "Authorization: Bearer $API_KEY" \\
  https://api.example.com/v2/resources?limit=5 | jq .
\`\`\`

## Phase 3: Training (Days 11-14)

### Training Sessions

| Session | Audience | Duration | Topics |
|---------|----------|----------|--------|
| Admin Training | IT Admins | 2 hours | User management, SSO, security settings |
| Developer Training | Dev Team | 3 hours | API integration, webhooks, SDKs |
| End User Training | All Users | 1 hour | Core features, workflows |
| Advanced Features | Power Users | 2 hours | Automation, custom reports |

## Phase 4: Go-Live (Day 15)

- [ ] Final data sync from legacy system
- [ ] DNS cutover (if custom domains)
- [ ] Enable production traffic
- [ ] Monitor error rates and latency
- [ ] Confirm customer sign-off
- [ ] Schedule 30-day review meeting

## Success Criteria

| Metric | Target | Measured At |
|--------|--------|-------------|
| Data Migration Accuracy | 99.9% | Go-live |
| API Integration Tests Passing | 100% | Go-live |
| Admin Users Trained | 100% | Go-live |
| End User Adoption | > 50% | 30 days |
| Support Tickets | < 10/week | 30 days |
`,
      category: "Onboarding",
      tags: ["onboarding", "enterprise", "customer-success", "checklist"],
      status: "draft",
      createdAt: yesterday,
      updatedAt: now,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versions: [],
    },
    {
      id: generateId(),
      title: "Security Hardening Guide",
      description:
        "Comprehensive security hardening procedures for production infrastructure including network, application, and access controls.",
      content: `# Security Hardening Guide

## Scope

This playbook covers security hardening for production infrastructure. Follow these procedures during initial deployment and during quarterly security reviews.

## 1. Network Security

### Firewall Rules

\`\`\`bash
# Allow only necessary inbound traffic
iptables -A INPUT -p tcp --dport 443 -j ACCEPT    # HTTPS
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/8 -j ACCEPT  # SSH from internal only
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -j DROP  # Drop everything else
\`\`\`

### TLS Configuration

\`\`\`nginx
# nginx.conf - TLS best practices
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;
\`\`\`

## 2. Application Security

### Environment Variables

> **NEVER** commit secrets to version control.

\`\`\`bash
# Use a secrets manager
export DB_PASSWORD=$(aws secretsmanager get-secret-value \\
  --secret-id prod/db/password \\
  --query SecretString --output text)
\`\`\`

### Container Security

\`\`\`dockerfile
# Use minimal base images
FROM alpine:3.19

# Don't run as root
RUN addgroup -S app && adduser -S app -G app
USER app

# Use specific versions, not latest
COPY --from=builder /app/binary /usr/local/bin/app

# Read-only filesystem
# Set in docker-compose or k8s securityContext
\`\`\`

## 3. Access Control

### Principle of Least Privilege

| Role | AWS Permissions | Database | Application |
|------|---------------|----------|-------------|
| Developer | ReadOnly + specific services | Read staging only | Full (non-prod) |
| SRE | Admin (with MFA) | Read/Write all | Full |
| DBA | RDS Admin | Full | Read configs |
| Auditor | SecurityAudit | Read logs only | Read audit logs |

### SSH Key Management

\`\`\`bash
# Generate ED25519 key (preferred over RSA)
ssh-keygen -t ed25519 -C "user@company.com"

# Disable password authentication
# /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
MaxAuthTries 3
\`\`\`

## 4. Monitoring & Alerting

### Critical Alerts

- Failed login attempts > 5 in 1 minute
- Privilege escalation events
- Unauthorized API access patterns
- Certificate expiry < 30 days
- Security group changes
- IAM policy modifications

## 5. Compliance Checklist

- [ ] All data encrypted at rest (AES-256)
- [ ] All data encrypted in transit (TLS 1.2+)
- [ ] MFA enabled for all admin accounts
- [ ] Audit logging enabled and shipped to SIEM
- [ ] Vulnerability scanning scheduled (weekly)
- [ ] Penetration testing completed (annually)
- [ ] Incident response plan documented and tested
- [ ] Data retention policies enforced
`,
      category: "Security",
      tags: ["security", "hardening", "compliance", "infrastructure"],
      status: "published",
      createdAt: lastWeek,
      updatedAt: yesterday,
      createdBy: SEED_USER_ID,
      updatedBy: SEED_USER_ID,
      versions: [],
    },
  ];
}
