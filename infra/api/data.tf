provider "aws" {
  region = var.region
}

data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "stage/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "nlb" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "stage/nlb/terraform.tfstate"
    region = "us-east-1"
  }
}
