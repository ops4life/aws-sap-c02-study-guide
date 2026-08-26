# Domain 1: Design Solutions for Organizational Complexity (26%)

## Overview
This domain covers designing for large, multi-team, multi-account organizations: hybrid and multi-VPC network connectivity, org-wide security controls, resilient/reliable architectures, multi-account governance with AWS Organizations, and cost visibility across the whole estate.

---

## 1. Architect Network Connectivity Strategies

### 1.1 AWS Global Infrastructure and VPC Connectivity Options

#### Global Infrastructure Building Blocks
- **Region**: isolated geographic area with 3+ Availability Zones (AZs)
- **Availability Zone (AZ)**: one or more discrete data centers with independent power/cooling/networking, low-latency links to other AZs in the Region
- **Local Zones**: extend a Region closer to end users for latency-sensitive workloads
- **Wavelength Zones**: embed compute/storage inside telco 5G networks for ultra-low latency
- **Edge locations**: CloudFront/Global Accelerator POPs, separate from Regions/AZs

#### VPC-to-VPC Connectivity Options

| Option | Use case | Transitive routing? | Scale |
|---|---|---|---|
| **VPC Peering** | Point-to-point, low VPC count | No | Manual, doesn't scale past ~dozens |
| **AWS Transit Gateway (TGW)** | Hub-and-spoke, many VPCs/VPNs/DX | Yes (via TGW route tables) | Thousands of attachments |
| **PrivateLink (VPC Endpoint Services)** | Expose a single service, not full network reachability | N/A (service-level, not network-level) | Very high, no route table entries |
| **AWS Cloud WAN** | Global, managed network-as-code across Regions | Yes | Enterprise-scale, policy-driven |

```bash
# Create a Transit Gateway and attach a VPC
aws ec2 create-transit-gateway --description "Org hub TGW" \
  --options AmazonSideAsn=64512,AutoAcceptSharedAttachments=disable,DefaultRouteTableAssociation=enable

aws ec2 create-transit-gateway-vpc-attachment \
  --transit-gateway-id tgw-0123456789abcdef0 \
  --vpc-id vpc-0123456789abcdef0 \
  --subnet-ids subnet-0a1 subnet-0b1
```

**Key exam distinction**: VPC Peering is **not transitive** — if VPC A peers with B, and B peers with C, A cannot reach C through B. Transit Gateway solves this by acting as a Layer 3 hub with its own route tables, enabling segmented (non-transitive-by-design) or fully-meshed topologies via route table associations/propagations.

### 1.2 Hybrid Connectivity (On-Premises Integration)

| Option | Bandwidth | Latency | Encryption | Use case |
|---|---|---|---|---|
| **Site-to-Site VPN** | Up to ~1.25 Gbps/tunnel | Higher (internet) | IPsec, always encrypted | Quick setup, backup path, low-medium bandwidth |
| **AWS Direct Connect (DX)** | 50 Mbps–100 Gbps | Low, consistent | Not encrypted by default (pair with VPN over DX or MACsec) | Sustained high-throughput, predictable latency |
| **DX + VPN (encrypted DX)** | DX bandwidth | Low | Encrypted | Compliance requiring both low latency and encryption |
| **Transit Gateway + DX Gateway** | Aggregate | Low | Per-VPN if layered | Multiple VPCs across multiple accounts/Regions over one DX connection |

```bash
# Create a Direct Connect gateway and associate a Transit Gateway
aws directconnect create-direct-connect-gateway --direct-connect-gateway-name org-dxgw --amazon-side-asn 64512
aws directconnect create-direct-connect-gateway-association \
  --direct-connect-gateway-id dxgw-abcd1234 \
  --gateway-id tgw-0123456789abcdef0
```

**Resiliency**: AWS recommends at minimum two DX connections at two different locations (or one DX + one VPN as backup) for production. Use **DX Resiliency Toolkit** guidance (development, high, and max resiliency models) to size redundancy correctly for the exam.

### 1.3 Hybrid DNS

- **Route 53 Resolver** provides two endpoint types for hybrid DNS:
  - **Inbound endpoint**: lets on-premises resolvers query AWS-hosted private hosted zones
  - **Outbound endpoint** + **Resolver rules**: lets VPC resources resolve on-premises domains, forwarding specific domains to on-prem DNS servers
- **Route 53 Resolver rules** can be shared across accounts via **AWS RAM** and associated with multiple VPCs — critical for centralized hybrid DNS in a multi-account org.
- Alternative: **Route 53 Private Hosted Zones** shared/associated across VPCs (same or cross-account via authorization) for AWS-internal private DNS, no on-prem dependency.

```bash
aws route53resolver create-resolver-endpoint \
  --creator-request-id "$(uuidgen)" \
  --direction OUTBOUND \
  --security-group-ids sg-0123456789abcdef0 \
  --ip-addresses SubnetId=subnet-0a1 SubnetId=subnet-0b1
```

### 1.4 Network Segmentation and Traffic Monitoring

- **Segmentation**: separate subnets per tier (public/app/data) and per environment; use security groups (stateful, instance-level) as the primary segmentation control and NACLs (stateless, subnet-level) for coarse, defense-in-depth blocking (e.g., explicit deny of a malicious CIDR).
- **IP addressing at scale**: plan non-overlapping CIDR ranges across accounts/VPCs up front — overlapping CIDRs block peering/TGW attachment later. Use **IPAM (VPC IP Address Manager)** to centrally plan, track, and auto-allocate CIDRs across the organization.
- **Traffic monitoring/troubleshooting tools**:
  - **VPC Flow Logs**: IP traffic metadata (accept/reject) to CloudWatch Logs, S3, or Kinesis Data Firehose — first stop for "why is traffic being blocked/allowed."
  - **VPC Reachability Analyzer**: static, config-based path analysis between two resources without generating traffic — quickly explains "why can't A reach B" (SG/NACL/route table misconfig).
  - **Traffic Mirroring**: copies actual packet traffic from an ENI to an analysis target (e.g., an IDS appliance) for deep packet inspection.
  - **Amazon CloudWatch Network Manager / Network Access Analyzer**: validates network access against intended security posture at scale.

## 2. Prescribe Security Controls

### 2.1 Identity and Access Management

- **IAM users/roles/policies**: prefer **roles** (temporary credentials via STS) over long-lived IAM user access keys, especially for workloads and cross-account access.
- **AWS IAM Identity Center** (formerly AWS SSO): centralized human-user access across all accounts in an AWS Organization, federated with an external IdP (Okta, Entra ID, etc.) via SAML 2.0/SCIM, using **permission sets** mapped to accounts.
- **Cross-account access** pattern: a role in Account B has a trust policy allowing `sts:AssumeRole` from a principal in Account A; Account A's users/roles then `AssumeRole` to operate in Account B — no shared long-term credentials.

```bash
# Assume a cross-account role
aws sts assume-role \
  --role-arn arn:aws:iam::222222222222:role/CrossAccountAdmin \
  --role-session-name session1
```

- **Third-party IdP integration**: use **IAM Identity Provider** objects (SAML or OIDC) to trust an external IdP directly for workload identity federation (e.g., GitHub Actions OIDC → IAM role), avoiding stored AWS credentials in CI/CD.

### 2.2 Network-Level Controls

| Control | Level | Stateful? | Default |
|---|---|---|---|
| **Security Group** | ENI/instance | Stateful (return traffic auto-allowed) | Deny all inbound, allow all outbound |
| **Network ACL** | Subnet | Stateless (must define both directions) | Default NACL allows all; custom NACL denies all |
| **Route Table** | Subnet | N/A | Controls next-hop, not permit/deny |

Exam trap: NACLs evaluate rules **in numeric order** and stop at first match — rule numbering matters. Security groups evaluate **all rules** (most permissive wins, since they're allow-only, no explicit deny).

### 2.3 Encryption and Key Management

- **AWS KMS**: centralized key management; supports **AWS managed keys**, **customer managed keys (CMKs)**, and **imported key material (BYOK)**. Multi-Region keys let you replicate the *same* key material across Regions for DR without re-encrypting data.
- **Envelope encryption**: KMS encrypts a data key, not the data itself directly for large payloads — the data key encrypts the data locally (used by S3, EBS, RDS encryption under the hood).
- **AWS Certificate Manager (ACM)**: free public/private TLS certs for ELB/CloudFront/API Gateway, auto-renewal; **ACM Private CA** for internal PKI.
- **Encryption in transit**: TLS termination at ALB/NLB/CloudFront/API Gateway, or end-to-end via mutual TLS.

```bash
aws kms create-key --description "Org data-at-rest key" --multi-region
aws kms replicate-key --key-id mrk-1234abcd... --replica-region us-west-2
```

### 2.4 Centralized Security Auditing and Notification

| Service | Purpose |
|---|---|
| **AWS CloudTrail** (Organization trail) | API call history across every account in the Org, delivered to one central S3 bucket |
| **IAM Access Analyzer** | Finds resources shared outside the account/Org boundary (S3 buckets, IAM roles, KMS keys, etc.) |
| **AWS Security Hub** | Aggregates findings from GuardDuty, Inspector, Macie, Config, third-party tools into one dashboard; supports Org-wide delegated administration |
| **Amazon GuardDuty** | Threat detection (VPC Flow Logs, DNS logs, CloudTrail); Org-wide via delegated administrator account |
| **Amazon Inspector** | Automated vulnerability scanning for EC2, ECR images, Lambda |
| **Amazon Detective** | Investigates and visualizes root cause after a GuardDuty finding |

**Pattern for the exam**: designate a **Security Tooling / Audit account** as the Security Hub, GuardDuty, and CloudTrail Org delegated administrator, and a separate **Log Archive account** as the destination for the Organization CloudTrail trail and Config aggregator — least-privilege separation of "who can see findings" vs "who can tamper with logs."

## 3. Design Reliable and Resilient Architectures

### 3.1 RTO/RPO-Driven DR Strategy Selection

| Strategy | RTO | RPO | Cost | Description |
|---|---|---|---|---|
| **Backup and Restore** | Hours | Hours | $ | Backups (e.g., S3, AMI, RDS snapshot) in a second Region; restore on disaster |
| **Pilot Light** | Tens of minutes | Minutes | $$ | Core data replicated live (e.g., RDS read replica); minimal/no compute running, scaled up on failover |
| **Warm Standby** | Minutes | Seconds–minutes | $$$ | Scaled-down but fully functional stack always running in DR Region; scale up on failover |
| **Multi-Site Active/Active** | Near-zero | Near-zero | $$$$ | Full production capacity live in 2+ Regions simultaneously, traffic split via Route 53/Global Accelerator |

- **AWS Elastic Disaster Recovery (DRS)**: continuous block-level replication of on-prem/EC2 servers to a low-cost staging area in AWS, with fast full-instance launch on failover — the managed way to implement pilot light/warm standby for lift-and-shift workloads.

### 3.2 Automated Recovery Patterns

- **Multi-AZ everything**: RDS Multi-AZ (synchronous standby, automatic failover), ELB across AZs, Auto Scaling group `min` ≥ 2 spanning ≥2 AZs.
- **Health-check-driven failover**: Route 53 health checks + failover routing policy for automatic Region-level failover of DNS.
- **Self-healing compute**: ASG replaces unhealthy instances automatically; combine with ALB target-group health checks (application-level) rather than just EC2 status checks (infra-level) for faster/more accurate detection.
- **Scale-up vs scale-out**: scale-up (vertical, bigger instance) is simpler but has ceilings and requires downtime for some engines; scale-out (horizontal, more instances) is the default HA pattern for stateless tiers — exam favors scale-out plus stateless design (session state externalized to ElastiCache/DynamoDB) wherever possible.

### 3.3 Backup and Restoration Strategy

- **AWS Backup**: centralized, policy-based (backup plans) backup across EC2/EBS/RDS/DynamoDB/EFS/FSx/Storage Gateway, with **cross-account and cross-Region copy** built in — the exam-preferred answer for "centralize backup policy across an Organization" (via **AWS Backup + Organizations integration / backup policies**).
- **S3** durability/versioning: S3 Standard is 11 nines durability *within* a Region; use **Cross-Region Replication (CRR)** and **S3 Object Lock** (WORM) for ransomware/compliance-grade retention.
- **RPO consideration**: continuous backup (e.g., DynamoDB point-in-time recovery, RDS automated backups with transaction logs) gives near-zero RPO; scheduled snapshots give RPO = snapshot interval.

```bash
aws backup create-backup-plan --backup-plan file://backup-plan.json
aws backup create-backup-vault --backup-vault-name org-central-vault
```

## 4. Design a Multi-Account AWS Environment

### 4.1 AWS Organizations and Control Tower

- **AWS Organizations**: management account + member accounts organized into **Organizational Units (OUs)**; **Service Control Policies (SCPs)** set the *maximum* allowed permissions per OU/account (they never grant permissions by themselves — IAM policies still must explicitly allow an action).
- **AWS Control Tower**: opinionated automation on top of Organizations — sets up a **Landing Zone** with a Log Archive account, an Audit/Security account, mandatory and strongly-recommended **guardrails** (implemented as SCPs and AWS Config rules), and **Account Factory** for standardized new-account vending.
- Common account structure: `Management` (root, billing only, no workloads) → OUs like `Security`, `Infrastructure`, `Workloads/Prod`, `Workloads/NonProd`, `Sandbox`, each with their own accounts.

```bash
aws organizations create-organizational-unit --parent-id r-abcd --name Workloads-Prod
aws organizations create-policy --name DenyLeaveOrg --type SERVICE_CONTROL_POLICY \
  --content file://scp-deny-leave-org.json
aws organizations attach-policy --policy-id p-examplepolicyid111 --target-id ou-abcd-11111111
```

### 4.2 Multi-Account Logging and Event Notification

- Aggregate CloudTrail, Config, and GuardDuty findings into a **dedicated Log Archive / Security account** (write-once, restricted access) — never the account generating the workload, to preserve log integrity if that account is compromised.
- **Amazon EventBridge** cross-account event bus: forward security/operational events (e.g., a GuardDuty finding) from every member account to a central account's event bus for automated response (e.g., trigger a Lambda remediation or a Slack notification via SNS/Chatbot).
- **AWS Chatbot** or SNS → email/Slack/Teams for org-wide alert routing.

### 4.3 Cross-Account Resource Sharing

- **AWS Resource Access Manager (RAM)**: share resources (subnets, TGW attachments, Route 53 Resolver rules, License Manager configs, ACM Private CA) across accounts/OUs *without* duplicating them or writing custom cross-account IAM policies for each resource type.
- **Shared VPC** (subnets shared via RAM into multiple accounts) centralizes networking ownership (network team owns the VPC/subnets) while application teams deploy resources (EC2, RDS, Lambda-in-VPC) into the shared subnets from their own accounts — the standard exam answer for "one network team, many app teams, avoid VPC peering sprawl."

```bash
aws ram create-resource-share --name shared-prod-subnets \
  --resource-arns arn:aws:ec2:us-east-1:111111111111:subnet/subnet-0a1 \
  --principals 222222222222 333333333333
```

## 5. Determine Cost Optimization and Visibility Strategies

### 5.1 Cost Monitoring Tools

| Tool | Purpose |
|---|---|
| **AWS Cost Explorer** | Visualize/forecast spend, filter/group by tag, service, account |
| **AWS Cost and Usage Report (CUR)** | Most granular, hourly line-item data → Athena/QuickSight for custom analysis |
| **AWS Budgets** | Alerts when actual/forecasted cost or usage exceeds a threshold |
| **AWS Trusted Advisor** | Checks across cost, performance, security, fault tolerance, service limits (some checks require Business/Enterprise Support) |
| **AWS Pricing Calculator** | Pre-purchase "what will this cost" estimation |

Enable **Cost Explorer + CUR at the Organization management account** with consolidated billing to see cost across all member accounts in one place.

### 5.2 Purchasing Options

| Option | Discount vs On-Demand | Commitment | Flexibility |
|---|---|---|---|
| **On-Demand** | Baseline | None | Full |
| **Savings Plans (Compute)** | Up to ~66% | 1 or 3 yr $/hr commitment | Any instance family/Region/OS, EC2+Fargate+Lambda |
| **Savings Plans (EC2 Instance)** | Higher than Compute SP | 1 or 3 yr | Locked to instance family + Region |
| **Reserved Instances** | Up to ~72% | 1 or 3 yr | Least flexible (esp. Standard RI); Convertible RI adds some flexibility |
| **Spot Instances** | Up to ~90% | None | Can be reclaimed with 2-min warning — for fault-tolerant/flexible workloads |

### 5.3 Right-Sizing, Tagging, and Cost Allocation

- **AWS Compute Optimizer**: ML-based right-sizing recommendations for EC2, EBS, Lambda, ECS on Fargate.
- **Amazon S3 Storage Lens**: org-wide S3 usage/activity visibility, identifies buckets to move to cheaper storage classes.
- **Tagging strategy**: enforce mandatory cost-allocation tags (e.g., `CostCenter`, `Environment`, `Owner`) via **AWS Config rules / Tag Policies (Organizations)** or SCPs that deny resource creation without required tags — then activate those as **cost allocation tags** in Billing so they appear in Cost Explorer/CUR breakdowns.

## Key Exam Tips
1. **VPC Peering is not transitive** — Transit Gateway is the answer whenever the question says "many VPCs" or "hub-and-spoke."
2. **SCPs never grant permissions** — they only set the ceiling; IAM policies still need an explicit `Allow`. A common trap answer tries to "grant access via SCP."
3. When a question mentions **"share networking centrally, multiple app teams deploy into it"** → Shared VPC via RAM, not one VPC per account peered together.
4. **RTO/RPO numbers in the question drive the DR strategy answer** — near-zero RPO/RTO → multi-site active/active; minutes → warm standby; hours → pilot light or backup/restore.
5. Logs and backups for security/compliance should land in a **separate, restricted account**, never stay only in the account that produced them.
6. **NACLs are stateless and order-matters; Security Groups are stateful and evaluate all rules.**
7. Route 53 Resolver **inbound** endpoints = on-prem queries AWS; **outbound** endpoints + rules = AWS queries on-prem.

## Practice Scenarios

### Scenario 1: Multi-VPC Connectivity at Scale
**Question**: A company has 40 VPCs across 12 AWS accounts that all need to reach a shared services VPC and each other, plus an on-premises data center over Direct Connect. What is the most operationally efficient connectivity design?

**Answer**:
1. Deploy an AWS Transit Gateway in a central networking account.
2. Attach all 40 VPCs to the TGW (cross-account via RAM-shared TGW attachment permissions).
3. Attach a Direct Connect Gateway to the TGW for on-premises connectivity.
4. Use TGW route tables to segment traffic (e.g., separate route tables for prod vs non-prod) instead of a single flat mesh.

### Scenario 2: Centralized Security Findings
**Question**: A security team wants a single dashboard showing GuardDuty and Inspector findings from all 25 accounts in the Organization, with the ability to take automated remediation action.

**Answer**:
1. Designate a Security Tooling account as the Organizations delegated administrator for GuardDuty, Inspector, and Security Hub.
2. Enable Org-wide auto-enrollment so new accounts are automatically covered.
3. Security Hub aggregates findings from GuardDuty/Inspector across all accounts into one view.
4. Use EventBridge rules on Security Hub findings to trigger Lambda-based automated remediation (e.g., isolate a compromised instance's security group).

## Additional Resources
- [Amazon VPC Connectivity Options whitepaper](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/introduction.html)
- [AWS Organizations documentation](https://docs.aws.amazon.com/organizations/)
- [AWS Control Tower documentation](https://docs.aws.amazon.com/controltower/)
- [Disaster Recovery of Workloads on AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
