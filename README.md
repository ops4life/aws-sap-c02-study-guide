# SAP-C02: AWS Certified Solutions Architect – Professional Study Guide

## Interactive Study Web App

This repository includes a single-page interactive study app — no build step, just static HTML/CSS/JS.

### Features
- 📚 4 domain guides covering the full SAP-C02 content outline, expanded with real AWS CLI examples, comparison tables, and practice scenarios
- ✅ Per-topic progress tracking (saved in your browser's `localStorage`)
- 📝 Personal notes per topic
- 📊 Visual progress dashboard (circular chart + completed/total topic counts)
- 🔍 Sidebar navigation auto-generated from each domain file's headings

### Quick Start

#### Option 1: GitHub Pages (Recommended)
Visit **[duyluann.github.io/aws-sap-c02-study-guide](https://duyluann.github.io/aws-sap-c02-study-guide/)**

#### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/duyluann/aws-sap-c02-study-guide.git
cd aws-sap-c02-study-guide

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Open your browser to http://localhost:8000
```

### How to Use the Study App
1. Select a domain from the sidebar to see its overview, or expand it to jump straight to a subtopic.
2. Click a topic to read its content; check the box at the bottom to mark it complete — the sidebar and dashboard update automatically.
3. Use the notes panel (top-right icon) to jot down personal notes per topic; they're saved locally in your browser.
4. Marking a topic complete auto-advances you to the next topic in sequence.

## About the SAP-C02 Exam

### Exam Details
| | |
|---|---|
| **Exam code** | SAP-C02 |
| **Format** | 65 scored multiple choice / multiple response questions (plus 10 unscored) |
| **Duration** | 180 minutes |
| **Passing score** | 750 out of 100–1,000 (scaled) |
| **Cost** | $300 USD |
| **Delivery** | Pearson VUE testing center or online proctored |
| **Prerequisite** | None required, but 2+ years of hands-on AWS solutions architecture experience is expected |

### Skills Measured (Domain Weights)
| Domain | Weight |
|---|---|
| 1: Design Solutions for Organizational Complexity | 26% |
| 2: Design for New Solutions | 29% |
| 3: Continuous Improvement for Existing Solutions | 25% |
| 4: Accelerate Workload Migration and Modernization | 20% |
| **Total** | **100%** |

## Study Guide Structure

### 🏢 [01_Organizational_Complexity.md](01_Organizational_Complexity.md)
Domain 1 (26%) — network connectivity strategies (Transit Gateway, Direct Connect, hybrid DNS), org-wide security controls (IAM Identity Center, cross-account roles, KMS, Security Hub/GuardDuty), reliable/resilient architecture (RTO/RPO-driven DR strategies), multi-account design (AWS Organizations, Control Tower, RAM), and cost visibility across an Organization.

### 🆕 [02_New_Solutions.md](02_New_Solutions.md)
Domain 2 (29%) — deployment strategy and IaC (CloudFormation, CI/CD, blue/green/canary), business continuity (Route 53 routing, Aurora Global Database, chaos testing with FIS), security-by-design, reliability patterns (loose coupling with SQS/SNS/EventBridge), performance (compute/storage/database selection, caching), and cost optimization for greenfield workloads.

### ♻️ [03_Continuous_Improvement.md](03_Continuous_Improvement.md)
Domain 3 (25%) — operational excellence (monitoring/alerting/automated remediation), security improvement (least-privilege auditing, vulnerability management), performance tuning (predictive scaling, CloudFront/Global Accelerator, Performance Insights), reliability remediation (AWS Resilience Hub, eliminating single points of failure), and ongoing cost optimization.

### 🚚 [04_Migration_and_Modernization.md](04_Migration_and_Modernization.md)
Domain 4 (20%) — migration assessment (Application Discovery Service, the 7 Rs, wave planning), migration tooling (MGN, DMS/SCT, DataSync, Snow Family), target architecture selection for migrated workloads (compute/container/storage/database), and post-migration modernization opportunities (serverless, decoupling, purpose-built databases).

## Prerequisites

### Technical Knowledge
- Solid understanding of core AWS services: EC2, S3, VPC, RDS, IAM, Lambda
- Familiarity with networking fundamentals (subnets, routing, DNS, TLS)
- Basic scripting/CLI comfort (AWS CLI, bash)

### AWS Experience
- 2+ years of hands-on experience designing and implementing AWS solutions is the target candidate profile per the official exam guide
- Prior AWS Certified Solutions Architect – Associate (or equivalent depth) is strongly recommended before attempting Professional

### Recommended Experience
- Have personally designed, deployed, and operated a multi-tier, multi-AZ (ideally multi-account) production workload on AWS
- Exposure to at least one migration project and one Infrastructure-as-Code workflow

## Study Strategy

### 1. Follow the Study Plan
Work through the four domain files in order — each builds vocabulary and services referenced by later domains (e.g., Domain 1's Transit Gateway/Organizations knowledge is assumed in Domain 4's migration networking).

### 2. Get Hands-On Experience
Reading is not enough at the Professional level. Actually build: a Transit Gateway hub-and-spoke topology, a CloudFormation StackSet deployed to multiple accounts, a blue/green CodeDeploy pipeline, a DMS migration between two RDS engines.

### 3. Use Multiple Resources
- The official [AWS Certified Solutions Architect – Professional Exam Guide](https://d1.awsstatic.com/training-and-certification/docs-sa-pro/AWS-Certified-Solutions-Architect-Professional_Exam-Guide.pdf) (the source outline for this study guide)
- AWS Whitepapers, especially the Well-Architected Framework and its pillar-specific deep-dive whitepapers
- AWS Skill Builder official practice question sets
- Hands-on labs in your own AWS account (use the AWS Free Tier / a sandbox account, never a production account)

### 4. Practice, Practice, Practice
This exam is scenario-heavy — every domain file in this guide ends with Practice Scenarios modeled on the exam's style (a business requirement, then "which AWS approach solves it"). Work through official AWS practice exams as your final gate before scheduling.

### 5. Join Study Groups
AWS certification communities (r/AWSCertifications, AWS user groups, LinkedIn study groups) are useful for clarifying ambiguous exam-guide language and sharing recent-exam-experience insights (without violating the NDA).

## Exam Tips

### Before the Exam
- Confirm ID requirements and arrive/log in early (15+ minutes for online proctored)
- Review the Key Exam Tips section at the end of each domain file the night before
- Get sleep — this is a 3-hour cognitively demanding exam

### During the Exam
- Flag-and-return questions you're unsure of; don't burn 10 minutes on one question early
- Watch for **absolute qualifiers** ("always," "never") in answer options — usually wrong for architecture trade-off questions
- Eliminate answers that solve the wrong problem first (e.g., a performance answer to a cost question), then choose the *best* remaining option, not just *a correct* one

### Question Types
- **Multiple choice**: 1 correct answer, 3 distractors
- **Multiple response**: 2+ correct answers out of 5+ options — read "select TWO/THREE" carefully, partial credit is not given

### Common Exam Topics
Based on the official appendix's in-scope services list: VPC/Transit Gateway/Direct Connect networking, multi-account governance (Organizations/Control Tower), DR strategy selection by RTO/RPO, IAM/KMS/Security Hub security design, CI/CD and blue-green/canary deployment, purpose-built database selection, and migration tooling (MGN/DMS/SCT/DataSync/Snow Family) selection.

## Cheat Sheet: In-Scope AWS Services by Category

Consolidated from the official exam guide appendix — a fast pre-exam scan, not a replacement for the domain files.

### Analytics
| Service | What it's for |
|---|---|
| Amazon Athena | Serverless SQL queries directly against S3 data |
| AWS Glue | Managed ETL, data catalog |
| Amazon EMR | Managed Hadoop/Spark clusters |
| Amazon Kinesis (Data Streams/Firehose/Data Analytics) | Real-time streaming ingestion, delivery, and analysis |
| Amazon MSK | Managed Apache Kafka |
| AWS Lake Formation | Data lake governance/permissions on top of S3+Glue |
| Amazon OpenSearch Service | Search and log analytics |
| Amazon QuickSight | BI dashboards |

### Application Integration
| Service | What it's for |
|---|---|
| Amazon SQS | Message queue for decoupling (standard/FIFO) |
| Amazon SNS | Pub/sub fan-out notifications |
| Amazon EventBridge | Event bus, SaaS/cross-account event routing |
| AWS Step Functions | Serverless workflow orchestration |
| Amazon AppFlow | Managed SaaS-to-AWS data integration |
| AWS AppSync | Managed GraphQL API |

### Compute
| Service | What it's for |
|---|---|
| Amazon EC2 / Auto Scaling | Virtual machines, elastic fleet management |
| AWS Lambda | Serverless functions |
| AWS Fargate | Serverless containers (ECS/EKS) |
| AWS Elastic Beanstalk | Managed PaaS deployment |
| AWS App Runner | Managed container/source-to-URL web app hosting |
| AWS Batch | Managed batch computing |
| AWS Outposts / Wavelength | AWS infrastructure on-premises / at the 5G edge |

### Containers
| Service | What it's for |
|---|---|
| Amazon ECS | AWS-native container orchestration |
| Amazon EKS | Managed Kubernetes |
| Amazon ECR | Container image registry |

### Database
| Service | What it's for |
|---|---|
| Amazon RDS / Aurora | Managed relational databases |
| Amazon DynamoDB | Serverless NoSQL key-value/document |
| Amazon ElastiCache | In-memory cache (Redis/Memcached) |
| Amazon DocumentDB | Managed MongoDB-compatible document DB |
| Amazon Neptune | Managed graph database |
| Amazon Redshift | Data warehouse |
| Amazon Timestream | Time-series database |
| Amazon Keyspaces | Managed Apache Cassandra-compatible |

### Management and Governance
| Service | What it's for |
|---|---|
| AWS CloudFormation | Infrastructure as Code |
| AWS Organizations / Control Tower | Multi-account management and landing zone |
| Amazon CloudWatch | Metrics, logs, alarms, dashboards |
| AWS CloudTrail | API call auditing |
| AWS Config | Resource configuration tracking/compliance |
| AWS Systems Manager | Patch/config management, automation, secrets |
| AWS Trusted Advisor | Best-practice checks (cost, security, performance, fault tolerance) |
| AWS Compute Optimizer | Right-sizing recommendations |

### Migration and Transfer
| Service | What it's for |
|---|---|
| AWS Migration Hub | Central migration tracking |
| AWS Application Discovery Service | On-prem inventory/dependency discovery |
| AWS Application Migration Service (MGN) | Lift-and-shift server rehost |
| AWS Database Migration Service (DMS) | Database migration, incl. CDC |
| AWS Schema Conversion Tool (SCT) | Heterogeneous schema/code conversion |
| AWS DataSync | Online bulk/scheduled data transfer |
| AWS Snow Family | Offline physical data transfer |
| AWS Transfer Family | Managed SFTP/FTPS/FTP over S3/EFS |

### Networking and Content Delivery
| Service | What it's for |
|---|---|
| Amazon VPC | Virtual private network |
| AWS Transit Gateway | Hub-and-spoke multi-VPC/VPN/DX connectivity |
| AWS Direct Connect | Dedicated on-prem-to-AWS network link |
| Amazon Route 53 | DNS + health-check-based routing |
| Amazon CloudFront | CDN / edge caching |
| AWS Global Accelerator | Performance routing for non-HTTP TCP/UDP traffic |
| AWS PrivateLink | Private service-to-service connectivity without traversing the internet |
| Elastic Load Balancing | ALB/NLB/GWLB traffic distribution |

### Security, Identity, and Compliance
| Service | What it's for |
|---|---|
| AWS IAM / IAM Identity Center | Access management, centralized SSO |
| AWS KMS | Encryption key management |
| AWS Certificate Manager | TLS certificate provisioning |
| Amazon GuardDuty | Threat detection |
| AWS Security Hub | Aggregated security findings dashboard |
| Amazon Inspector | Automated vulnerability scanning |
| Amazon Macie | Sensitive data (PII) discovery in S3 |
| AWS Secrets Manager | Secret storage with automatic rotation |
| AWS WAF / Shield | Web application firewall / DDoS protection |
| AWS Firewall Manager | Centralized WAF/Shield/SG policy management |

### Storage
| Service | What it's for |
|---|---|
| Amazon S3 (+ Glacier) | Object storage, archival |
| Amazon EBS | Block storage for EC2 |
| Amazon EFS | Managed NFS file storage |
| Amazon FSx | Managed Windows/Lustre/NetApp/OpenZFS file storage |
| AWS Backup | Centralized, policy-based backup |
| AWS Storage Gateway | Hybrid on-prem-to-S3 storage bridge |
| AWS Elastic Disaster Recovery | Continuous replication-based DR |

## AWS CLI Quick Reference

### Networking
```bash
# Transit Gateway
aws ec2 create-transit-gateway --description "hub"
aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id tgw-xxx --vpc-id vpc-xxx --subnet-ids subnet-xxx

# Route 53 Resolver
aws route53resolver create-resolver-endpoint --direction OUTBOUND ...
```

### Organizations and Governance
```bash
# Organizations
aws organizations create-organizational-unit --parent-id r-xxx --name Workloads-Prod
aws organizations attach-policy --policy-id p-xxx --target-id ou-xxx

# Resource Access Manager
aws ram create-resource-share --name shared-subnets --resource-arns arn:aws:ec2:...:subnet/subnet-xxx --principals 222222222222
```

### Deployment
```bash
# CloudFormation
aws cloudformation deploy --template-file template.yaml --stack-name my-stack --capabilities CAPABILITY_NAMED_IAM
aws cloudformation create-stack-set --stack-set-name org-baseline --template-body file://baseline.yaml --permission-model SERVICE_MANAGED
```

### Migration
```bash
# DataSync
aws datasync create-task --source-location-arn ... --destination-location-arn ...

# DMS
aws dms create-replication-task --replication-task-identifier task1 --migration-type full-load-and-cdc ...
```

### Monitoring and Cost
```bash
# CloudWatch alarm
aws cloudwatch put-metric-alarm --alarm-name high-5xx-rate --metric-name HTTPCode_Target_5XX_Count --namespace AWS/ApplicationELB --statistic Sum --period 60 --threshold 10 --comparison-operator GreaterThanThreshold --evaluation-periods 3

# Budgets
aws budgets create-budget --account-id 111111111111 --budget file://budget.json --notifications-with-subscribers file://notifications.json
```

## Important AWS Service Quotas and Limits

| Resource | Default limit | Notes |
|---|---|---|
| VPCs per Region | 5 (soft limit) | Adjustable via Service Quotas |
| Transit Gateway attachments per TGW | 5,000 | Hard limit |
| Direct Connect connections per Region per account | 50 (soft) | Adjustable |
| Lambda concurrent executions per Region | 1,000 (soft, account-level) | Adjustable; use reserved/provisioned concurrency to guarantee capacity for critical functions |
| S3 bucket count per account | 100 (soft, can request up to 1,000+) | Buckets themselves have virtually unlimited objects |
| RDS DB instances per Region | 40 (soft) | Adjustable |
| EC2 On-Demand vCPUs per Region (per instance family group) | Varies, soft | A very common real-world scaling blocker — request increases proactively |
| CloudFormation stack resources | 500 per stack | Use nested stacks to work around this |
| IAM roles per account | 1,000 (soft) | Adjustable |
| Organizations accounts per Organization | 10 by default (soft) | Adjustable, request increase for large enterprises |

Always check current values in the [AWS Service Quotas console](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) — limits change over time and vary by account history/Region.

## Out of Scope for the Exam
Per the official exam guide appendix, the following are explicitly **not** tested:
- Amazon GameLift
- Frontend development for mobile apps
- 12-factor app methodology
- In-depth knowledge of operating systems

## Additional Resources

### Official AWS Resources
- [AWS Certified Solutions Architect – Professional exam page](https://aws.amazon.com/certification/certified-solutions-architect-professional/)
- [Official SAP-C02 Exam Guide (PDF)](https://d1.awsstatic.com/training-and-certification/docs-sa-pro/AWS-Certified-Solutions-Architect-Professional_Exam-Guide.pdf)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [AWS Skill Builder](https://skillbuilder.aws/)

### Tools
- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/)

### Community
- r/AWSCertifications
- Local AWS User Groups
- AWS re:Post

## Study Checklist

### Pre-Study Setup
- [ ] Create/access an AWS sandbox account (not production) for hands-on labs
- [ ] Set up AWS Budgets billing alerts on the sandbox account before experimenting
- [ ] Read the official SAP-C02 exam guide PDF once end-to-end for orientation

### Domain 1: Organizational Complexity (26%)
- [ ] Build a Transit Gateway hub-and-spoke topology across 2+ VPCs
- [ ] Set up AWS Organizations with at least 2 OUs and a Service Control Policy
- [ ] Configure a DR strategy (pilot light or warm standby) for a sample workload

### Domain 2: New Solutions (29%)
- [ ] Deploy a CloudFormation stack and practice a Change Set preview
- [ ] Set up a CodePipeline with a blue/green or canary deployment
- [ ] Decouple two services with SQS and observe scaling based on queue depth

### Domain 3: Continuous Improvement (25%)
- [ ] Create a CloudWatch composite alarm and an EventBridge-triggered remediation
- [ ] Run an AWS Resilience Hub assessment against a sample application
- [ ] Use IAM Access Analyzer's policy generation on a real role

### Domain 4: Migration and Modernization (20%)
- [ ] Walk through the AWS Migration Hub / Application Discovery Service console flow
- [ ] Practice a DMS homogeneous migration between two RDS instances
- [ ] Map a fictitious application portfolio to the 7 Rs

### Final Preparation
- [ ] Complete an official AWS practice exam and review every missed question
- [ ] Re-read the Key Exam Tips section in all four domain files
- [ ] Schedule the exam once consistently scoring 80%+ on practice questions

## Good Luck!
You've got this. Focus on understanding *why* one AWS service beats another for a given scenario — the exam is testing judgment, not memorization.
