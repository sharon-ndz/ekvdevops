terraform {
  backend "s3" {
    bucket  = "my-terraform-state-bckt4321"   
    key     = "dev/ecr/terraform.tfstate"       
    region  = "eu-west-1"
    encrypt = true
  }
}
