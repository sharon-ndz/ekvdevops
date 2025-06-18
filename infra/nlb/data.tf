data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "${var.environment}/terraform.tfstate"
    region = var.region
  }
}

data "terraform_remote_state" "cloudwatch" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"  # Your main state bucket
    key    = "${var.environment}/cloudwatch.tfstate"   # Update this if different
    region = "us-east-1"
  }
}
