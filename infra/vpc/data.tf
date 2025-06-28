#data "terraform_remote_state" "s3" {
#  backend = "s3"
#  config = {
#    bucket = var.tf_state_bucket
#    key    = "dev/terraform.tfstate"
#    region = "us-east-1"
#  }
#}
