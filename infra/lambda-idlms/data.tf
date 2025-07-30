data "terraform_remote_state" "vpc" {
  backend = "s3"

  config = {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/lambda/vpc/terraform.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "ssm" {
  backend = "s3"

  config = {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/lambda/ssm/terraform.tfstate"
    region = "eu-west-1"
  }
}
