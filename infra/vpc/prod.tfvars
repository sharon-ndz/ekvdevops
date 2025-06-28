###VPC###
enable_dns_support          = true
enable_dns_hostnames        = true
vpc_name                    = "prod-idlms-vpc"
vpc_cidr                    = "10.120.0.0/16"

###IGW###
internet_gateway_name       = "prod-idlms-igw"

###NGW###
eip_for_nat_gateway_name    = "prod-idlms-eip"
nat_gateway_name            = "prod-idlms-ngw"

###Private Subnets###
private_lb_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.120.15.0/26", "10.120.15.64/26", "10.120.15.128/26"],
    "subnets_name_prefix": "prod-lb",
    "route_table_name": "prod-lb"
}

private_app_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.120.16.0/22", "10.120.20.0/22", "10.120.24.0/22"],
    "subnets_name_prefix": "prod-app",
    "route_table_name": "prod-app"
}

##Private Data Subnets
private_data_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.120.40.0/24", "10.120.41.0/24", "10.120.42.0/24"],
    "subnets_name_prefix": "prod-data",
    "route_table_name": "prod-data",
    "is_public": true
}

##Private Services Subnets
private_services_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.120.254.0/26", "10.120.254.64/26", "10.120.254.128/26"],
    "subnets_name_prefix": "prod-service",
    "route_table_name": "prod-service",
}

###Public Subnets###
public_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.120.0.0/24", "10.120.1.0/24", "10.120.2.0/24"],
    "subnets_name_prefix": "prod-public",
    "map_public_ip_on_launch": true,
    "route_table_name": "prod-public"
}
ec2_tags = {
  Name = "Backend API IDLMS-prod"
}


instance_type = "t3.medium"
