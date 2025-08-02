data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = idlms-terraformstate-dev-574643567490
    key    = "dev/vpc/terraform.tfstate"
    region = eu-west-1
  }
}

