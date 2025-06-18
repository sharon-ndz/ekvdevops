# CloudWatch Logging for Docker API - Terraform Configuration

## Overview

This Terraform configuration sets up:
1. **CloudWatch Log Group** for Docker API logs
2. **SSM Parameter** for Docker log collection agent config

---

## 🔧 Resources

### 1. `aws_cloudwatch_log_group.docker_api`
- Log group: `/docker/api`
- Retention: 7 days
- Tags: `Name = DockerAPI`
- Lifecycle protection enabled 
### 2. `aws_ssm_parameter.docker_logs_config`
- Name: `/cloudwatch/docker-config`
- Type: `String`
- Overwrites enabled
- Stores CloudWatch agent JSON config to collect logs from Docker containers at:
  `/var/lib/docker/containers/*/*.log`
- Uses `/docker/api` log group

---

## 📦 Input Variables (`variables.tf`)
| Variable            | Description                                | Default              |
|---------------------|--------------------------------------------|----------------------|
| `environment`       | Deployment environment (e.g. stage, prod)  | `stage`              |
| `region`            | AWS region                                 | `us-east-1`          |
| `access_logs_prefix`| Prefix path inside S3 bucket               | `stage/nlb`          | Prefix path inside S3 bucket               | `stage/nlb`          |
---

## 🧰 Tfvars (`stage.tfvars`)
```hcl
environment        = "stage"
region             = "us-east-1"
access_logs_bucket = "nlb-access-logs-stage-nyo9xe"
access_logs_prefix = "stage/nlb"
```


## 📁 Files
- `main.tf`, `nlb_logs.tf`, `ssm.tf`, `outputs.tf`, `variables.tf`, `stage.tfvars`, `data.tf`

