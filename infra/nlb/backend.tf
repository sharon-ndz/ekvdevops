terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/nlb/terraform.tfstate"
    region = "eu-west-1"
    encrypt = true
  }
}

