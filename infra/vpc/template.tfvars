environment = "{{env}}"
region      = "eu-west-1"
ec2_ssm_profile_name = "{{env}}-ec2_ssm_profile"
ec2_ssm_role_name    = "ec2_ssm_role-{{env}}"
tf_state_bucket      = "{{env}}-btl-idlms-backend-api-tfstate"
ami_id               = "ami-01f23391a59163da9"
docker_artifact_bucket = "{{env}}-idlms-website-built-artifact"
app_ports = [4000, 4001, 4002]
enable_dns_support   = true
enable_dns_hostnames = true
vpc_name             = "{{env}}-idlms-vpc"
vpc_cidr             = "10.122.0.0/16"

common_tags = {
  "Owner"      = "IDLMS"
  "Project"    = "Terraform VPC"
  "Environment"= "{{env}}"
}

internet_gateway_name = "{{env}}-idlms-igw"
total_nat_gateway_required = 3
eip_for_nat_gateway_name   = "{{env}}-idlms-eip"
nat_gateway_name           = "{{env}}-idlms-ngw"

public_subnets = {
  cidrs_blocks         = ["10.122.1.0/24", "10.122.2.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b"]
  subnets_name_prefix  = "{{env}}-public"
  route_table_name     = "{{env}}-public"
  map_public_ip_on_launch = true
  routes               = []
}

private_subnets = {
  cidrs_blocks         = ["10.122.10.0/24", "10.122.20.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b"]
  subnets_name_prefix  = "{{env}}-private"
  route_table_name     = "{{env}}-private"
  routes               = []
}

private_lb_subnets = {
  cidrs_blocks         = ["10.121.15.0/26", "10.121.15.64/26", "10.121.15.128/26"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "{{env}}-lb"
  route_table_name     = "{{env}}-lb"
  routes               = []
}

private_app_subnets = {
  cidrs_blocks         = ["10.121.16.0/22", "10.121.20.0/22", "10.121.24.0/22"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "{{env}}-app"
  route_table_name     = "{{env}}-app"
  routes               = []
}

private_data_subnets = {
  cidrs_blocks         = ["10.121.40.0/24", "10.121.41.0/24", "10.121.42.0/24"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "{{env}}-data"
  route_table_name     = "{{env}}-data"
  routes               = []
  is_public            = true
}

private_services_subnets = {
  cidrs_blocks         = ["10.121.254.0/26", "10.121.254.64/26", "10.121.254.128/26"]
  availability_zones   = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  subnets_name_prefix  = "{{env}}-service"
  route_table_name     = "{{env}}-service"
  routes               = []
}

ec2_tags = {
  Name = "Backend API IDLMS-{{env}}"
}

instance_type = "t2.micro"
