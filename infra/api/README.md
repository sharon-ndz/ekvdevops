# Terraform API Gateway Infrastructure

This Terraform configuration provisions a secure and monitored **AWS API Gateway** integrated with a **private Network Load Balancer (NLB)** via **VPC Link**. It also enables **CloudWatch logging**, **WAF protection**, and **API throttling** through usage plans and API keys.

---

## 📁 Project Structure

```
infra/api/
├── backend.tf                # S3 backend for remote Terraform state
├── data.tf                   # Data sources for VPC and NLB state
├── main.tf                   # Core resources: API Gateway, VPC Link, integration
├── outputs.tf                # Output values for API URL, log group, and key
├── stage.tfvars              # Stage-specific variables
├── variables.tf              # Input variable declarations
├── throttling.tf             # API key, usage plan, and throttling config
├── waf.tf                    # WAF rules and association with API Gateway
```

---

## 🚀 Features

### ✅ API Gateway
- **REST API** in **REGIONAL** mode.
- Exposes a single `{proxy+}` resource for flexible path matching.
- Integrates with NLB over **VPC Link** to route traffic to port **4000**.

### 🔐 Security
- **WAFv2** Web ACL protects the API from abuse:
  - Rate-based rule: blocks IPs exceeding **1000 requests/5 min**.
- **API Key** is required for access.
- Usage Plan limits:
  - **Rate limit:** 5 RPS  
  - **Burst limit:** 10  
  - **Quota:** 10,000 requests/month

### 📊 Monitoring & Logging
- API Gateway logs are pushed to **CloudWatch Logs**.
- IAM role and policy allow API Gateway to publish logs.
- Logs are stored under:
  ```
  /aws/api-gateway/stage-api
  ```

---

## 🔧 Inputs

Defined in `variables.tf` and overridden by `stage.tfvars`:

| Name         | Description               | Default      |
|--------------|---------------------------|--------------|
| `region`     | AWS region                | `us-east-1`  |
| `environment`| Deployment environment    | `stage`      |

---

## 📤 Outputs

| Name               | Description                    |
|--------------------|--------------------------------|
| `api_gateway_url`  | URL to access the REST API     |
| `api_key_value`    | API key to access the endpoint |
| `api_log_group_name`| CloudWatch log group name     |

---

## 🔁 Integration Flow

```
Client
  ↓
API Gateway (REST - ANY /{proxy+})
  ↓ (VPC Link)
NLB (Private, Port 4000)
  ↓
EC2 / Backend Service
```

---

## 🪪 WAF Configuration

- WAF Scope: `REGIONAL`
- Attached to: API Gateway Stage
- Rules:
  - `LimitRequestsPerIP`: Blocks IPs sending more than 1000 requests in 5 minutes.

---

## 🔑 API Key Throttling

- **API Key** required for all requests.
- Enforced via Usage Plan.
- Rate-limiting and quota applied at API Gateway level.

---

## 🗂 Remote State Dependencies

This module references other Terraform state files:

| Resource | S3 State Key                      |
|----------|----------------------------------|
| VPC      | `stage/terraform.tfstate`        |
| NLB      | `stage/nlb/terraform.tfstate`    |

---

## 🧪 Deployment

To initialize and deploy this infrastructure:

```
cd infra/api
terraform init -backend-config="key=stage/api/terraform.tfstate"
terraform plan -var-file="stage.tfvars"
terraform apply -var-file="stage.tfvars"
```

---

## 📎 Notes

- Make sure NLB is already provisioned and exported via Terraform state.
- The backend service should be listening on **port 4000**.
- CloudWatch and IAM permissions must be correctly configured for full observability.

---

## 🧼 Clean Up

To remove the infrastructure:

```
terraform destroy -var-file="stage.tfvars"
```

---
