data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "${var.environment}/terraform.tfstate"
    region = var.region
  }
}

