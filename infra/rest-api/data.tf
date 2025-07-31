data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "stage/vpc/terraform.tfstate"
    region = var.tf_state_region
  }
}

data "terraform_remote_state" "nlb" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "stage/nlb/terraform.tfstate"
    region = var.tf_state_region
  }
}
