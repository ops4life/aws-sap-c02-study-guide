# Domain 2: Design for New Solutions (29%)

## Overview
This domain covers greenfield solution design: deployment/IaC strategy, business continuity, security controls by requirement, reliability, performance, and cost optimization for new workloads. It is the largest domain (29%) and overlaps heavily with the AWS Well-Architected Framework pillars.

---

## 1. Design a Deployment Strategy to Meet Business Requirements

### 1.1 Infrastructure as Code

- **AWS CloudFormation**: declarative, native IaC. **Nested stacks** for reuse; **StackSets** to deploy the same template across many accounts/Regions (the exam answer for "deploy a baseline stack to every account in the Organization").
- **AWS CDK**: imperative code (TypeScript/Python/etc.) that synthesizes to CloudFormation — preferred when the team wants programming-language constructs (loops, conditionals, testing) over raw templates.
- **Change Sets**: preview what a stack update will actually do before executing — the answer whenever a question asks about "safely preview infrastructure changes."

```bash
aws cloudformation deploy --template-file template.yaml --stack-name my-stack \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation create-stack-set --stack-set-name org-baseline \
  --template-body file://baseline.yaml --permission-model SERVICE_MANAGED \
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false
```

### 1.2 CI/CD and Deployment Strategies

| Strategy | Downtime | Rollback speed | Risk |
|---|---|---|---|
| **All-at-once** | Yes | Slow (redeploy) | Highest |
| **Rolling** | No (partial capacity dip) | Slow | Medium |
| **Rolling with additional batch** | No | Medium | Medium |
| **Blue/Green** | No | Instant (flip traffic back) | Low |
| **Canary** | No | Fast (shift % of traffic back) | Lowest |

- **AWS CodePipeline** orchestrates **CodeCommit/GitHub → CodeBuild → CodeDeploy**; **CodeDeploy** natively supports in-place and blue/green deployments for EC2/ECS/Lambda.
- **Lambda**: use **weighted alias traffic shifting** (linear/canary via CodeDeploy) to gradually shift invocations to a new version, with CloudWatch alarm-triggered automatic rollback.
- **ECS/EKS**: blue/green via CodeDeploy (ECS) or rolling/blue-green via native Kubernetes deployment strategies + a service mesh or ALB weighted target groups.

### 1.3 Configuration Management and Managed-Service Adoption

- **AWS Systems Manager**: State Manager (enforce config state), Patch Manager (automated patching), Run Command (ad hoc execution at scale), Parameter Store (config/secrets), Automation (runbooks) — the toolset for "reduce patching/config overhead" answers.
- Prefer managed services (Aurora over self-managed MySQL on EC2, Fargate over self-managed ECS EC2 capacity, managed NAT Gateway over self-managed NAT instance) whenever the requirement is to "reduce operational overhead" — a very common phrase pointing to the managed-service answer.

## 2. Design a Solution to Ensure Business Continuity

### 2.1 Route 53 Routing for Resiliency

| Routing policy | Use case |
|---|---|
| **Simple** | Single resource, no health checks |
| **Failover** | Active-passive DR — primary record with health check, secondary as failover |
| **Latency-based** | Route to the Region with lowest latency for the user |
| **Geolocation** | Route based on user's geographic location (compliance/data residency) |
| **Geoproximity** (traffic flow) | Shift traffic between Regions using a "bias" value |
| **Weighted** | Percentage-based split, e.g., canary or A/B |
| **Multi-value answer** | Return multiple healthy IPs, client-side load balancing with health checks |

### 2.2 Data and Database Replication for BC

- **RDS Multi-AZ**: synchronous standby in another AZ, automatic failover (same Region) — availability, not primarily a read-scaling feature.
- **RDS Read Replicas** (can be cross-Region): asynchronous, for read scaling; a cross-Region replica can be **promoted** to standalone for DR, but that's a manual/scripted failover, not automatic.
- **Aurora Global Database**: primary Region + up to 5 secondary Regions, sub-second replication lag, secondary can be promoted in <1 minute for cross-Region DR with much lower RPO/RTO than standard cross-Region read replicas.
- **S3 Cross-Region Replication (CRR)**, **DynamoDB Global Tables** (multi-Region, multi-active, last-writer-wins) for other data stores.

### 2.3 DR Testing and Automated Recovery

- Regularly **test failover** (not just configure it) — e.g., scheduled Route 53 failover drills, AWS Fault Injection Simulator (FIS) to inject failure and validate automated recovery actually works.
- **AWS FIS**: chaos-engineering service to simulate AZ outages, instance termination, API throttling, etc., in a controlled way to validate resiliency assumptions before a real disaster.
- Centralized monitoring (CloudWatch composite alarms, EventBridge rules) that trigger automated remediation (e.g., Lambda restarts a service, ASG replaces instances) rather than relying on a human to notice.

## 3. Determine Security Controls Based on Requirements

### 3.1 Least-Privilege IAM Design

- Write IAM policies scoped to specific resources/actions/conditions (not `Resource: "*"`), use **permissions boundaries** to cap what an IAM role/user can be granted even by someone with `iam:CreatePolicy` access, and prefer roles over long-lived credentials.
- **IAM policy conditions** (`aws:SourceIp`, `aws:MultiFactorAuthPresent`, `aws:PrincipalOrgID`) to further restrict access (e.g., require MFA for sensitive actions, restrict API calls to only originate from within the Organization).

### 3.2 Network Flow Control

Reuse security groups/NACLs (see Domain 1 §2.2) at the per-application level: e.g., a 3-tier app's ALB SG allows 443 from `0.0.0.0/0`, the app-tier SG allows the app port only from the ALB's SG (SG-to-SG reference, not CIDR), and the DB-tier SG allows only from the app-tier SG.

### 3.3 Attack Mitigation for Web Applications

| Service | Protects against |
|---|---|
| **AWS WAF** | Layer 7: SQLi, XSS, bad bots, rate-based rules |
| **AWS Shield Standard** | Automatic, free, Layer 3/4 DDoS protection for all customers |
| **AWS Shield Advanced** | Enhanced DDoS protection, 24/7 DRT support, cost protection during attacks, integrates with WAF |
| **Amazon GuardDuty** | Threat detection (compromised credentials, malicious IPs, crypto-mining) |
| **AWS Firewall Manager** | Centrally manage WAF rules/Shield Advanced/Security Groups across accounts in an Organization |

```bash
aws wafv2 create-web-acl --name protect-alb --scope REGIONAL \
  --default-action Allow={} --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=protectAlb \
  --rules file://waf-rules.json
```

### 3.4 Encryption and Patch Compliance

Same KMS/ACM tools as Domain 1 §2.3, applied per-workload. For patch compliance, **Systems Manager Patch Manager** with **Patch Baselines** and **Maintenance Windows**, reporting compliance via **Systems Manager Compliance** — a required answer whenever "remain compliant with organizational patching standards" appears.

## 4. Design a Strategy to Meet Reliability Requirements

### 4.1 Multi-AZ / Multi-Region Architecture Patterns

- Stateless compute tier behind an ALB spanning ≥2 AZs, ASG with `min` ≥ 2.
- Stateful tier: Multi-AZ RDS/Aurora, ElastiCache with Multi-AZ replication group (Redis) or cluster mode.
- Service quotas: know that **default service quotas can block scaling** during a real event (e.g., EC2 vCPU limits per Region) — request quota increases proactively (via Service Quotas console/API) for critical services ahead of expected peak.

### 4.2 Loose Coupling and Application Integration

| Service | Pattern |
|---|---|
| **Amazon SQS** | Point-to-point buffering/decoupling; standard (at-least-once) or FIFO (exactly-once, ordered) |
| **Amazon SNS** | Pub/sub fan-out to multiple SQS queues/Lambdas/HTTP endpoints |
| **AWS Step Functions** | Orchestrate multi-step workflows with retries/error handling as first-class citizens |
| **Amazon EventBridge** | Event bus for decoupled, event-driven architectures, including SaaS/cross-account event sources |

**SQS + ASG scaling pattern**: scale consumer ASG based on `ApproximateNumberOfMessagesVisible` — decouples producer burst rate from consumer capacity, a classic "handle unpredictable spiky load reliably" answer.

### 4.3 High-Availability Operations

- **Application-level health checks** (ALB target group health check hitting a real app endpoint) catch more failure modes than **EC2 status checks** alone.
- DNS-level failover (Route 53 health check + failover routing) for Region-level HA; database-level failover (RDS Multi-AZ, Aurora) for data-tier HA — the exam expects layered HA at every tier, not just compute.

## 5. Design a Solution to Meet Performance Objectives

### 5.1 Compute Selection

| Family | Optimized for |
|---|---|
| **General purpose (M, T)** | Balanced — web servers, small DBs |
| **Compute optimized (C)** | CPU-bound — batch processing, gaming servers, HPC |
| **Memory optimized (R, X, z1d)** | In-memory DBs, real-time big data analytics |
| **Storage optimized (I, D, H)** | High sequential I/O — NoSQL DBs, data warehousing |
| **Accelerated computing (P, G, Inf, Trn)** | ML training/inference, graphics |

### 5.2 Storage Selection

| Service | Type | Use case |
|---|---|---|
| **EBS gp3/io2** | Block, single-AZ, attach to one instance (Multi-Attach exception for io1/io2) | Boot volumes, DBs |
| **Instance Store** | Ephemeral, highest IOPS | Temp/cache data, lost on stop |
| **EFS** | File, multi-AZ, shared across instances | Shared content, Linux workloads |
| **FSx for Windows/Lustre/NetApp/OpenZFS** | File, protocol/workload-specific | Windows shares, HPC, enterprise NAS migration |
| **S3** | Object | Static content, data lake, backups |

### 5.3 Purpose-Built Databases

| Database | Model | Best for |
|---|---|---|
| **RDS/Aurora** | Relational | Transactional, ACID, complex joins |
| **DynamoDB** | Key-value/document | Massive scale, single-digit ms latency, serverless |
| **ElastiCache (Redis/Memcached)** | In-memory cache | Sub-ms latency caching, session store, leaderboards |
| **DocumentDB** | Document (MongoDB-compatible) | JSON document workloads |
| **Neptune** | Graph | Highly connected data, fraud detection, social graphs |
| **Timestream** | Time-series | IoT/metrics data |
| **Keyspaces** | Wide-column (Cassandra-compatible) | Existing Cassandra workloads |
| **Redshift** | Data warehouse (columnar) | Analytics/BI, large-scale aggregation |
| **OpenSearch** | Search/log analytics | Full-text search, log analytics |

### 5.4 Caching, Buffering, and Elasticity Patterns

- **Caching**: CloudFront (edge, static/dynamic content), ElastiCache (application/DB query cache), DAX (DynamoDB-specific microsecond cache).
- **Buffering**: SQS/Kinesis Data Streams absorb burst write rates so downstream systems process at their own sustainable pace.
- **Elasticity**: Auto Scaling (target tracking > step > simple scaling policies, in that preference order for most cases), Aurora Serverless v2 for unpredictable DB load, Lambda/Fargate for workloads with no idle-capacity tolerance.

## 6. Determine a Cost Optimization Strategy for New Solutions

Builds on Domain 1 §5. New-solution-specific angle: pick the **right pricing model at design time** (e.g., default new fleets to Savings Plans commitment once usage is predictable; use Spot for stateless/fault-tolerant batch/CI workers from day one), model **data transfer costs** early (same-AZ traffic is free between resources with private IP, cross-AZ and cross-Region transfer both cost money — a frequent "why is this architecture expensive" root cause), and choose storage tiering (S3 Intelligent-Tiering when access patterns are unknown) instead of over-provisioning.

## Key Exam Tips
1. **"Reduce operational overhead" / "reduce management burden"** almost always points to a managed/serverless service (Aurora, Fargate, Lambda, managed NAT Gateway) over the self-managed equivalent.
2. **Blue/green or canary is the answer when the requirement is "zero-downtime with instant rollback."** Rolling deployments still have some risk window and slower rollback.
3. **Aurora Global Database beats standard cross-Region read replicas** whenever the question needs low-RPO, fast-promote cross-Region DR for a relational database.
4. Loose coupling questions (spiky/unpredictable load, one component's failure shouldn't cascade) → **SQS/SNS/EventBridge**, not direct synchronous calls.
5. **Data transfer costs and same-AZ vs cross-AZ traffic** are a recurring cost-optimization scenario trigger.
6. Choosing a purpose-built database is about **access pattern**, not just data size — know the table above cold.

## Practice Scenarios

### Scenario 1: Zero-Downtime Deployment with Fast Rollback
**Question**: An application team deploys a new version weekly and needs zero downtime, with the ability to abort within seconds if error rates spike after deployment. What deployment strategy and tools should be used?

**Answer**:
1. Use AWS CodeDeploy with a blue/green deployment strategy (ECS or EC2/ASG).
2. Configure CloudWatch alarms on error rate/latency tied to the deployment.
3. Enable automatic rollback on alarm — CodeDeploy shifts traffic back to the original (blue) environment automatically.
4. For Lambda, use a canary/linear alias-shifting deployment with the same CloudWatch alarm-based rollback.

### Scenario 2: Decoupling a Spiky Order-Processing Workload
**Question**: An order-processing service receives unpredictable traffic spikes up to 50x baseline for short periods, and downstream inventory processing cannot handle synchronous spikes without errors.

**Answer**:
1. Insert an Amazon SQS queue between the order API and the inventory processing service.
2. Have the inventory service (ASG or Lambda) scale based on `ApproximateNumberOfMessagesVisible` (or Lambda's native SQS event-source scaling).
3. This buffers the burst, letting inventory processing consume messages at a sustainable rate without dropping orders.

## Additional Resources
- [AWS Well-Architected Framework — Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [AWS Well-Architected Framework — Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)
- [Amazon Route 53 Routing Policies](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [AWS CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)
- [Choosing an AWS database service](https://aws.amazon.com/products/databases/)
