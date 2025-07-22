data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "nlb" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/nlb/terraform.tfstate"
    region = "us-east-1"
  }
}
