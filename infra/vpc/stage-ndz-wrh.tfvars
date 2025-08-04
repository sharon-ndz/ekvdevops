environment = "stage-ndz-wrh"
region      = "eu-west-1"
ec2_ssm_profile_name = "stage-ndz-wrh-ec2_ssm_profile"
ec2_ssm_role_name    = "ec2_ssm_role-stage-ndz-wrh"
tf_state_bucket      = "stage-ndz-wrh-btl1-idlms-sharon-backend-api-tfstate"
ami_id               = "ami-01f23391a59163da9"
docker_artifact_bucket = "idlms-stage-ndz-wrh-built-artifact-592776312448"
app_ports = [4000, 4001, 4002]
enable_dns_support   = true
enable_dns_hostnames = true
vpc_name             = "stage-ndz-wrh-idlms-vpc"
vpc_cidr             = "10.122.0.0/16"

common_tags = {
  "Owner"      = "IDLMS"
  "Project"    = "Terraform VPC"
  "Environment"= "stage-ndz-wrh"
}

internet_gateway_name = "stage-ndz-wrh-idlms-igw"
total_nat_gateway_required = 3
eip_for_nat_gateway_name   = "stage-ndz-wrh-idlms-eip"
nat_gateway_name           = "stage-ndz-wrh-idlms-ngw"

public_subnets = {
  cidrs_blocks         = ["10.122.1.0/24", "10.122.2.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b"]
  subnets_name_prefix  = "stage-ndz-wrh-public"
  route_table_name     = "stage-ndz-wrh-public"
  map_public_ip_on_launch = true
  routes               = []
}

private_subnets = {
  cidrs_blocks         = ["10.122.10.0/24", "10.122.20.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b"]
  subnets_name_prefix  = "stage-ndz-wrh-private"
  route_table_name     = "stage-ndz-wrh-private"
  routes               = []
}

private_lb_subnets = {
  cidrs_blocks         = ["10.121.15.0/26", "10.121.15.64/26", "10.121.15.128/26"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "stage-ndz-wrh-lb"
  route_table_name     = "stage-ndz-wrh-lb"
  routes               = []
}

private_app_subnets = {
  cidrs_blocks         = ["10.121.16.0/22", "10.121.20.0/22", "10.121.24.0/22"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "stage-ndz-wrh-app"
  route_table_name     = "stage-ndz-wrh-app"
  routes               = []
}

private_data_subnets = {
  cidrs_blocks         = ["10.121.40.0/24", "10.121.41.0/24", "10.121.42.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "stage-ndz-wrh-data"
  route_table_name     = "stage-ndz-wrh-data"
  routes               = []
  is_public            = true
}

private_services_subnets = {
  cidrs_blocks         = ["10.121.254.0/26", "10.121.254.64/26", "10.121.254.128/26"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "stage-ndz-wrh-service"
  route_table_name     = "stage-ndz-wrh-service"
  routes               = []
}

ec2_tags = {
  Name = "Backend API IDLMS-stage-ndz-wrh"
}

instance_type = "t2.medium"
