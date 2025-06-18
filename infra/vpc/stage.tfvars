###VPC###
environment = "stage"
region      = "us-east-1"

common_tags = {
  "Owner" = "IDLMS"
  "Project" = "Terraform VPC"
  "Environment" = "Stage"
}
tf_state_bucket = "my-terraform-state-bckt43"

ami_id = "ami-084568db4383264d4"

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

instance_type = "t2.micro"
