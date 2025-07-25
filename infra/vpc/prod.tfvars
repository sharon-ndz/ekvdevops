environment = "prod"
region      = "us-east-1"
ec2_ssm_profile_name = "prod-ec2_ssm_profile"
ec2_ssm_role_name    = "ec2_ssm_role-prod"
tf_state_bucket      = "my-terraform-state-bckt43"
ami_id               = "ami-020cba7c55df1f615"
app_ports = [4000, 4001, 4002]
docker_artifact_bucket = "idlms-website-built-artifact"

enable_dns_support   = true
enable_dns_hostnames = true
vpc_name             = "prod-idlms-vpc"
vpc_cidr             = "10.123.0.0/16"

common_tags = {
  "Owner"      = "IDLMS"
  "Project"    = "Terraform VPC"
  "Environment"= "prod"
}

internet_gateway_name = "prod-idlms-igw"
total_nat_gateway_required = 3
eip_for_nat_gateway_name   = "prod-idlms-eip"
nat_gateway_name           = "prod-idlms-ngw"

public_subnets = {
  cidrs_blocks         = ["10.123.1.0/24", "10.123.2.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
  subnets_name_prefix  = "prod-public"
  route_table_name     = "prod-public"
  map_public_ip_on_launch = true
  routes               = []
}

private_subnets = {
  cidrs_blocks         = ["10.123.10.0/24", "10.123.20.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
  subnets_name_prefix  = "prod-private"
  route_table_name     = "prod-private"
  routes               = []
}

private_lb_subnets = {
  cidrs_blocks         = ["10.123.15.0/26", "10.123.15.64/26", "10.123.15.128/26"]
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  subnets_name_prefix  = "prod-lb"
  route_table_name     = "prod-lb"
  routes               = []
}

private_app_subnets = {
  cidrs_blocks         = ["10.123.16.0/22", "10.123.20.0/22", "10.123.24.0/22"]
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  subnets_name_prefix  = "prod-app"
  route_table_name     = "prod-app"
  routes               = []
}

private_data_subnets = {
  cidrs_blocks         = ["10.123.40.0/24", "10.123.41.0/24", "10.123.42.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  subnets_name_prefix  = "prod-data"
  route_table_name     = "prod-data"
  routes               = []
  is_public            = true
}

private_services_subnets = {
  cidrs_blocks         = ["10.123.254.0/26", "10.123.254.64/26", "10.123.254.128/26"]
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  subnets_name_prefix  = "prod-service"
  route_table_name     = "prod-service"
  routes               = []
}

ec2_tags = {
  Name = "Backend API IDLMS-stage"
}

instance_type = "t2.micro"
