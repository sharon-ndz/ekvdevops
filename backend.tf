terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt43"
    key    = "stage/cloudwatch.tfstate"
    region = "us-east-1"
  }
}
