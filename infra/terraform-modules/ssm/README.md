# Terraform Module: SSM Parameter for Lambda Environment

This Terraform module creates an **AWS SSM Parameter Store** entry to securely store environment variables as a **SecureString**. This is commonly used to provide configuration or secrets to Lambda functions or EC2 instances in a secure and manageable way.

---

## Resources Created

- `aws_ssm_parameter.lambda_env`: A secure SSM parameter storing key-value pairs as a JSON string.


Security
Uses SecureString to encrypt the parameter.

Use IAM permissions to restrict access to the parameter.

Ignores changes to the value to prevent accidental overwrites.



