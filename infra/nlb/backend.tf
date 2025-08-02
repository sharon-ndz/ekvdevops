terraform {
  backend "s3" {
    key    = "dev/nlb/terraform.tfstate"
    region = "eu-west-1"
    encrypt = true
  }
}

