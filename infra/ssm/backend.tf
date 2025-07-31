terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bckt4321"      
    key            = "stage/ssm/terraform.tfstate"          
    region         = "eu-west-1"
    encrypt        = true
  }
}
