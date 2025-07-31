terraform {
  backend "s3" {
    bucket         = "stage-btl-idlms-backend-api-tfstate"      
    key            = "stage/s3/terraform.tfstate"          
    region         = "eu-west-1"
    encrypt        = true
  }
}
