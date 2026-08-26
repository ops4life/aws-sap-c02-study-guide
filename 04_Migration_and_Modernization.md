# Domain 4: Accelerate Workload Migration and Modernization (20%)

## Overview
This domain covers selecting and executing migrations of existing on-premises/other-cloud workloads to AWS — assessment, migration approach/tooling, target architecture selection, and post-migration modernization opportunities.

---

## 1. Select Existing Workloads and Processes for Potential Migration

### 1.1 Migration Assessment and Tracking

- **AWS Migration Hub**: single place to track migration progress across multiple AWS and partner migration tools, and to view/import a discovered application portfolio.
- **AWS Application Discovery Service**: agentless (via VMware vCenter) or agent-based discovery of on-prem server inventory, performance data, and process/network dependency mapping — the required first step before you can build a valid migration wave plan.
- **AWS Migration Evaluator** (formerly TSO Logic): builds a data-driven business case (current-state cost vs projected AWS cost) from discovery data.

### 1.2 Portfolio Assessment and the 7 Rs

| R | Meaning | When to use |
|---|---|---|
| **Retire** | Decommission | App no longer needed |
| **Retain** | Keep as-is (for now) | Not ready, revisit later, or too costly to migrate now |
| **Rehost** ("lift and shift") | Move as-is, no code change | Fast migration, minimal risk, e.g., via AWS Application Migration Service |
| **Relocate** | Move to AWS without changes, for VMware/hypervisor-level workloads | e.g., VMware Cloud on AWS |
| **Repplatform** ("lift, tinker, and shift") | Some optimization, no core architecture change | e.g., move DB to RDS, keep app logic the same |
| **Repurchase** ("drop and shop") | Replace with a SaaS/different product | Move to a COTS/SaaS replacement |
| **Refactor / Re-architect** | Redesign using cloud-native services | Long-term strategic apps needing new features/scale not possible on current architecture |

### 1.3 Wave Planning and TCO

- Group applications into **migration waves** based on dependencies (discovered via Application Discovery Service), business priority, complexity, and risk — typically start with low-complexity, low-risk, high-confidence wins to build momentum, and sequence dependent applications together.
- **Total Cost of Ownership (TCO)** comparison (via AWS Migration Evaluator or Pricing Calculator) justifies the migration business case and informs which target architecture (rehost vs replatform) delivers the best ROI for a given app.

## 2. Determine the Optimal Migration Approach for Existing Workloads

### 2.1 Data Migration

| Tool | Use case |
|---|---|
| **AWS DataSync** | Online, automated transfer of large datasets (NFS/SMB/object storage) to/from S3, EFS, FSx, with scheduling and validation |
| **AWS Transfer Family** | Managed SFTP/FTPS/FTP endpoints backed by S3/EFS, for partners/legacy workflows expecting those protocols |
| **AWS Snow Family (Snowcone/Snowball/Snowmobile)** | Offline, physical transfer for very large datasets or limited/no network connectivity |
| **Amazon S3 Transfer Acceleration** | Speeds up uploads over long distances via CloudFront edge locations |

Decision driver: **available bandwidth and data volume**. Rule of thumb the exam expects — if transferring over the network would take **weeks**, use Snow Family; if there's a decent pipe and it's an ongoing/scheduled sync, use DataSync.

```bash
aws datasync create-task --source-location-arn arn:aws:datasync:...:location/loc-0nfs \
  --destination-location-arn arn:aws:datasync:...:location/loc-0s3 \
  --schedule ScheduleExpression="cron(0 2 * * ? *)"
```

### 2.2 Application Migration

- **AWS Application Migration Service (MGN)**: agent-based, continuous block-level replication of on-prem/other-cloud servers to AWS with minimal downtime cutover — the current standard rehost tool (successor to CloudEndure Migration; same underlying technology as Elastic Disaster Recovery).
- **AWS Server Migration Service (SMS)**: legacy, being phased out in favor of MGN for most new rehost projects — know it exists for the exam but MGN is the primary current answer.

### 2.3 Database Migration

- **AWS Database Migration Service (DMS)**: homogeneous (MySQL→MySQL) or heterogeneous (Oracle→Aurora PostgreSQL) migration, supports **continuous data replication (CDC)** for minimal-downtime cutover.
- **AWS Schema Conversion Tool (SCT)**: converts source schema/stored procedures/code to the target engine's dialect for **heterogeneous** migrations — required before DMS can move data when engines differ significantly. Not needed for homogeneous migrations.

```bash
aws dms create-replication-task --replication-task-identifier ora-to-aurora \
  --source-endpoint-arn arn:aws:dms:...:endpoint:src-oracle \
  --target-endpoint-arn arn:aws:dms:...:endpoint:tgt-aurora \
  --migration-type full-load-and-cdc --table-mappings file://mappings.json
```

### 2.4 Networking, Identity, and Governance for Migration

- Extend on-prem network to AWS via Direct Connect/VPN (Domain 1 §1.2) before migrating so hybrid dependencies keep working during transition.
- **AWS Directory Service** (AWS Managed Microsoft AD, or trust relationship to on-prem AD) so migrated Windows workloads keep existing AD-based auth without a parallel identity system; **IAM Identity Center** for centralized human access to the new AWS environment.
- Apply **AWS Control Tower / Organizations** governance (Domain 1 §4.1) to the landing zone *before* migrating workloads into it, not after.

## 3. Determine a New Architecture for Existing Workloads

### 3.1 Compute Platform Selection

Choose based on how much re-architecture the workload can tolerate: **EC2** (rehost, most control), **Elastic Beanstalk** (replatform, managed PaaS with less ops overhead but still EC2-based), containers (repurpose existing container workloads), **Lambda** (only for refactored, event-driven/stateless workloads — not a direct rehost target).

### 3.2 Container Hosting Platform Selection

| Option | Control plane | Data plane | Use case |
|---|---|---|---|
| **ECS on EC2** | AWS-managed | Self-managed EC2 capacity | Cost control, existing EC2 reservations, simpler AWS-native orchestration |
| **ECS on Fargate** | AWS-managed | AWS-managed (serverless) | No infrastructure management, pay per task |
| **EKS on EC2** | AWS-managed control plane | Self-managed EC2 capacity | Existing Kubernetes tooling/expertise, need node-level control |
| **EKS on Fargate** | AWS-managed | AWS-managed (serverless) | Kubernetes API compatibility with no node management |
| **Amazon ECR** | — | — | Private container registry for all of the above |

**Exam signal**: "team already has significant Kubernetes investment/tooling" → EKS; "team wants AWS-native simplicity, no existing K8s requirement" → ECS; "no infrastructure management at all" → Fargate (either orchestrator).

### 3.3 Storage Service Selection for Migrated Workloads

Reapply Domain 2 §5.2 selection criteria to migration context: e.g., an on-prem NFS file share typically maps to **EFS**; an on-prem Windows file share maps to **FSx for Windows File Server**; on-prem SAN/iSCSI block storage maps to **EBS** (per-instance) or **FSx**; **AWS Storage Gateway (File/Volume/Tape Gateway)** provides a hybrid bridge that lets an on-prem application keep using local-like storage while data is actually tiered to S3/EBS/Glacier during a phased migration.

### 3.4 Database Platform Selection for Migrated Workloads

Reapply Domain 2 §5.3's purpose-built database table; migration-specific nuance is **self-managed databases on EC2** as an interim/rehost option when the source engine/version isn't supported by a managed service yet, with a plan to move to RDS/Aurora once supportable — call this out explicitly when a question describes an unsupported legacy engine version.

## 4. Determine Opportunities for Modernization and Enhancements

### 4.1 Serverless and Decoupling Opportunities

- **AWS Lambda** for event-driven, short-duration, bursty-traffic components — the top modernization target after a rehost/replatform, once traffic patterns and integration points are well understood in the AWS environment.
- Identify components to **decouple** (see Domain 2 §4.2 loose-coupling patterns) that were tightly coupled on-prem simply because synchronous calls were the only option available in the old environment — post-migration is the natural point to introduce SQS/SNS/EventBridge between them.

### 4.2 Container Modernization

Migrate monolith-in-a-VM to containers on ECS/EKS/Fargate as an intermediate modernization step before further decomposition into microservices, when a full serverless rewrite isn't yet justified.

### 4.3 Purpose-Built Database Adoption

Post-migration, revisit whether the "safe" choice made during migration (e.g., lift-and-shift to RDS for everything) should be selectively replaced: high-scale key-value access patterns → DynamoDB; unpredictable relational load → Aurora Serverless v2; hot cache-friendly reads → ElastiCache — using the Domain 2 §5.3 table as the decision framework.

### 4.4 Application Integration Modernization

Replace custom polling/batch integration code inherited from the on-prem design with **SQS/SNS/EventBridge/Step Functions**, matching the pattern to the need: point-to-point buffering → SQS; fan-out → SNS; complex multi-step orchestration with retries/compensation → Step Functions; SaaS/partner event ingestion → EventBridge.

## Key Exam Tips
1. **Know the 7 Rs cold** — questions frequently describe a scenario and ask "which migration strategy" without naming the R explicitly.
2. **MGN is the current rehost tool** (agent-based, continuous replication, minimal-downtime cutover); SMS is legacy — if a question emphasizes "current AWS-recommended," pick MGN.
3. **SCT is only needed for heterogeneous DMS migrations** (different source/target engines) — a same-engine (e.g., MySQL→MySQL) migration needs DMS alone.
4. **Snow Family vs DataSync**: decide based on available bandwidth/timeline, not just data volume alone — a huge dataset with ample bandwidth and time can still use DataSync.
5. **Discovery before wave planning**: Application Discovery Service dependency mapping must precede grouping applications into migration waves — a question describing "we don't know our application dependencies yet" points to this service as the missing first step.
6. Post-migration modernization opportunities (Lambda, purpose-built DBs, decoupling) are usually a **second-phase** answer — don't pick "refactor to serverless" as the *migration* strategy itself unless the question is explicitly about a new architecture design, not the migration approach.

## Practice Scenarios

### Scenario 1: Choosing a Data Transfer Method
**Question**: A company needs to migrate 400 TB of archival data from an on-premises NAS to Amazon S3. The site has a 100 Mbps internet connection, and the data must be available in AWS within one week.

**Answer**:
1. Calculate transfer time over the available link — at 100 Mbps, 400 TB would take months, not one week.
2. Use the AWS Snow Family (Snowball Edge, or multiple devices in parallel) to physically ship the data.
3. Once in AWS, use AWS DataSync for ongoing incremental syncs of any new data generated after the initial bulk transfer.

### Scenario 2: Heterogeneous Database Migration
**Question**: A company is migrating a business-critical Oracle database to Amazon Aurora PostgreSQL with minimal downtime, and the source database uses complex stored procedures.

**Answer**:
1. Use AWS Schema Conversion Tool (SCT) to convert the Oracle schema and stored procedures to PostgreSQL-compatible equivalents, flagging any that need manual rework.
2. Use AWS DMS with full-load-and-CDC (change data capture) to perform the initial bulk load and then continuously replicate ongoing changes.
3. Cut over during a brief maintenance window once DMS CDC lag reaches near-zero, minimizing downtime.

## Additional Resources
- [AWS Migration Hub documentation](https://docs.aws.amazon.com/migrationhub/)
- [AWS Prescriptive Guidance — Migration strategies (the 7 Rs)](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-migration/welcome.html)
- [AWS Application Migration Service (MGN)](https://docs.aws.amazon.com/mgn/)
- [AWS Database Migration Service](https://docs.aws.amazon.com/dms/)
- [AWS Snow Family](https://aws.amazon.com/snow/)
