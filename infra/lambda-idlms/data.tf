data "terraform_remote_state" "vpc" {
  backend = "s3"

  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/lambda/vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "ssm" {
  backend = "s3"

  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/lambda/ssm/terraform.tfstate"
    region = "us-east-1"
  }
}
