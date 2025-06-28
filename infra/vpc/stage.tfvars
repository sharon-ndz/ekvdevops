###VPC###
environment = "stage"
region      = "us-east-1"
ec2_ssm_profile_name = "stage-ec2_ssm_profile"
ec2_ssm_role_name = "ec2_ssm_role-stage"

common_tags = {
  "Owner" = "IDLMS"
  "Project" = "Terraform VPC"
  "Environment" = "Stage"
}
tf_state_bucket = "my-terraform-state-bckt43"

ami_id = "ami-002d575a01b3b0003"

enable_dns_support          = true
enable_dns_hostnames        = true
vpc_name                    = "stage-idlms-vpc"
vpc_cidr                    = "10.122.0.0/16"

###IGW###
internet_gateway_name       = "stage-idlms-igw"

###NGW###
total_nat_gateway_required  = 3
eip_for_nat_gateway_name    = "stage-idlms-eip"
nat_gateway_name            = "stage-idlms-ngw"

public_subnets = {
  cidrs_blocks         = ["10.122.1.0/24", "10.122.2.0/24"]
  map_public_ip_on_launch = true
  route_table_name     = "public-route-table"
  subnets_name_prefix  = "public-subnet"
  routes              = []
}


private_subnets = {
  cidrs_blocks         = ["10.122.10.0/24", "10.122.20.0/24"]
  route_table_name     = "private-route-table"
  subnets_name_prefix  = "private-subnet"
  routes              = []
}

private_lb_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.15.0/26", "10.121.15.64/26", "10.121.15.128/26"],
    "subnets_name_prefix": "stage-lb",
    "route_table_name": "stage-lb"
}


private_app_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.16.0/22", "10.121.20.0/22", "10.121.24.0/22"],
    "subnets_name_prefix": "stage-app",
    "route_table_name": "stage-app"
}

private_data_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.40.0/24", "10.121.41.0/24", "10.121.42.0/24"],
    "subnets_name_prefix": "stage-data",
    "route_table_name": "stage-data",
    "is_public": true,
}

private_services_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.254.0/26", "10.121.254.64/26", "10.121.254.128/26"],
    "subnets_name_prefix": "stage-service",
    "route_table_name": "stage-service",
}

ec2_tags = {
  Name = "Backend API IDLMS-stage"
}

instance_type = "t2.micro"
