provider "aws" {
  region = var.region
}

data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = var.vpc_state_key
    region = var.region
  }
}

data "terraform_remote_state" "nlb" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = var.nlb_state_key
    region = var.region
  }
}

