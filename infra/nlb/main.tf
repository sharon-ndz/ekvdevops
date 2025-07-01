#module "cloudwatch" {
 # source                = "git::https://github.com/sharon-ndz/terraform-modules.git//cloudwatch"
  #environment           = var.environment
 # region                = var.region

  # Required additional variables
  #tf_state_bucket       = var.tf_state_bucket
  #ssm_param_name        = var.ssm_param_name
  #ssm_tag_name          = var.ssm_tag_name
  #docker_log_group_name = var.docker_log_group_name
  #log_group_tag_name    = var.log_group_tag_name
  #access_logs_bucket    = var.access_logs_bucket
  #access_logs_prefix    = var.access_logs_prefix
#}

provider "aws" {
  region = var.region
}

locals {
  # Build a map of AZ => subnet ID
  subnets_by_az = {
    for idx, az in data.terraform_remote_state.vpc.outputs.private_subnets_azs :
    az => data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
  }

  # Unique subnet per AZ for NLB
  unique_subnets_per_az = [
    for az, subnet_id in local.subnets_by_az :
    { az = az, subnet_id = subnet_id }
  ]
}


module "group_1_nlb" {
  source               = "../terraform-modules/nlb"

  name                 = "${var.environment}-idlms-nlb"
  internal             = var.internal
  load_balancer_type   = var.load_balancer_type
  vpc_id               = data.terraform_remote_state.vpc.outputs.vpc_id
  target_ips           = [data.terraform_remote_state.vpc.outputs.ec2_private_ip]
  target_port          = var.target_port
  environment          = var.environment

  subnet_mapping = [
    for entry in local.unique_subnets_per_az :
    { subnet_id = entry.subnet_id }
  ]

  create_sg     = var.lb_create_sg
  sg_name       = "${var.environment}-group-1-nlb-sg"
  ingress_roles = local.lb_sg_ingress_roles
  egress_roles  = var.lb_egress_roles
  tags          = var.common_tags
}



  # ✅ Use S3 bucket created by local cloudwatch module
#  access_logs_bucket = var.access_logs_bucket
#  access_logs_prefix = var.access_logs_prefix 

