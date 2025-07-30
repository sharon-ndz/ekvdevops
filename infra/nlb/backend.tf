terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt432"
    key    = "dev/nlb/terraform.tfstate"
    region = "eu-north-1"
    encrypt = true
  }
}

