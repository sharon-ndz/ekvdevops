terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/cloudwatch/terraform.tfstate"
    region = "eu-west-1"
  }
}
