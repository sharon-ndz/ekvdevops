data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "var.tf_state_bucket"
    key    = "var.tf_state_key"
    region = "eu-west-1"
  }
}

