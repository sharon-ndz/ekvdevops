terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bckt432"      
    key            = "dev/s3/terraform.tfstate"          
    region         = "us-east-1"
    encrypt        = true
  }
}
