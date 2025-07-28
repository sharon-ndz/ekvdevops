# Destroy Multi License API Infrastructure

This GitHub Actions pipeline (`destroy-multi-license-api.yml`) tears down all Terraform-managed infrastructure associated with the Multi-License API deployment. It supports selective environment destruction (`dev`, `staging`, `prod`) via manual dispatch.

---

##  File: `.github/workflows/destroy-multi-license-api.yml`

This file defines the pipeline that destroys the following infrastructure components:

- **CloudWatch Logs**
- **API Gateway (REST API)**
- **Network Load Balancer (NLB)**
- **VPC and Subnets**
- **ECR Repository**
- **SSM Parameters**

---

## Prerequisites

Before using this pipeline, ensure the following are in place:

###  GitHub Repository Setup

- Branch: `feature/btl-48` (or adjust in the workflow if using a different branch)
- Path structure:

### Required GitHub Secrets

Make sure these secrets are defined under **Repository Settings > Secrets and variables > Actions**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

###  Terraform State Bucket

Your remote backend must be configured using an S3 bucket named:my-terraform-state-bckt43

---

##  How to Use

### 1. Open GitHub Actions

Navigate to the **Actions** tab of your repository.

### 2. Find `Destroy Multi License API Infrastructure` Workflow

Click on the workflow named:  
**“Destroy Multi License API Infrastructure”**

### 3. Click **“Run workflow”**

A form will appear. Enter the environment you want to destroy:

| Field | Description | Example |
|-------|-------------|---------|
| `ENV` | The target environment to destroy | `dev`, `staging`, or `prod` |

### 4. Confirm and Run

Click the **“Run workflow”** button to begin destroying the infrastructure.

---

## ⚙️ What Happens Internally?

For each Terraform directory, the pipeline performs:

1. `terraform init` with appropriate remote backend config  
2. `terraform destroy -auto-approve` with the matching `*.tfvars` file for the environment  
3. It proceeds sequentially from CloudWatch → API Gateway → NLB → VPC → ECR → SSM

---




