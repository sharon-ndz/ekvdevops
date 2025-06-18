# Network Load Balancer (NLB) Infrastructure – Terraform

This Terraform module defines the configuration for provisioning a **private Network Load Balancer (NLB)** along with associated security groups, logging, and integration with CloudWatch.

---

## 🔧 Folder Structure
This setup assumes the following folder:
```
~/idms/infra/nlb/
```

---

## 📁 Included Files

- `backend.tf`: Configures remote backend on S3 for storing Terraform state.
- `main.tf`: Invokes reusable modules for CloudWatch and NLB.
- `data.tf`: Fetches remote state data for VPC and CloudWatch.
- `locals.tf`: Defines local variables for NLB configuration.
- `variables.tf`: All required input variables.
- `outputs.tf`: Key NLB outputs (ARN, DNS name, etc.).
- `stage.tfvars`: Stage-specific values for deploying this module.

---

## 🌐 NLB Configuration

| Setting              | Value                     |
|----------------------|---------------------------|
| Type                 | Network Load Balancer     |
| Scope                | Internal (private)        |
| Target Port          | 4000                      |
| Subnets              | Private subnets (from VPC state) |
| Security Group       | Created with custom ingress/egress rules |
| Access Logs Bucket   | Created via CloudWatch module |
| Environment          | `stage`                   |
| Region               | `us-east-1`               |

---

## 🛡 Security Group Rules

### Ingress
- Allow TCP traffic on port `4000` from anywhere (`0.0.0.0/0`)

### Egress
- Allow all outbound traffic

---

## 📦 Modules Used

### 1. `cloudwatch` (local path: `../cloudwatch`)
- Creates an S3 bucket for NLB access logging.

### 2. `group_1_nlb` (path: `../../../terraform-modules`)
- Deploys the actual NLB, security groups, and target group.

---

## 📤 Outputs

- `nlb_id`: Load balancer ID
- `nlb_arn`: Load balancer ARN
- `nlb_dns_name`: DNS name for the NLB
- `nlb_zone_id`: Route53 zone ID
- `nlb_arn_suffix`: ARN suffix
- `nlb_listener_arn`: Listener ARN (used for monitoring, ALB rules, etc.)

---

---

## 🚀 Deployment

```bash
terraform init -backend-config="bucket=my-terraform-state-bckt43"
terraform plan -var-file="stage.tfvars"
terraform apply -var-file="stage.tfvars"
```

---

## 🏷 Tags

```hcl
common_tags = {
  Environment = "dev"
  Project     = "IDMS"
}
```

---

## 📎 Notes

- This NLB is private (not internet-facing).
- Target EC2 instances are fetched from VPC remote state.
- Logging is enabled via S3 bucket created by the CloudWatch module.
