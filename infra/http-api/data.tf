# --- data.tf ---

# VPC remote state (e.g., for subnet IDs, security groups, VPC ID, etc.)
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket           # "my-terraform-state-bckt43"
    key    = "${var.environment}/terraform.tfstate"  # dev/terraform.tfstate
    region = var.region                    # "us-east-1"
  }
}

# NLB remote state (e.g., for listener ARN, DNS name, etc.)
data "terraform_remote_state" "nlb" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/nlb-state/terraform.tfstate"  # Hardcoded correctly
    region = "us-east-1"
  }
}

