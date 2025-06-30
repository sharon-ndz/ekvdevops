terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bckt43"             # your state bucket
    key            = "dev/ssm/terraform.tfstate"           # change to dev/prod as needed
    region         = "us-east-1"
    encrypt        = true
  }
}
