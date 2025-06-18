###VPC###
enable_dns_support          = true
enable_dns_hostnames        = true
vpc_name                    = "dev-idlms-vpc"
vpc_cidr                    = "10.121.0.0/16"

###IGW###
internet_gateway_name       = "dev-cfs-igw"

###NGW###
total_nat_gateway_required  = 3
eip_for_nat_gateway_name    = "dev-idlms-eip"
nat_gateway_name            = "dev-idlms-ngw"

###Private Subnets###
private_lb_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.15.0/26", "10.121.15.64/26", "10.121.15.128/26"],
    "subnets_name_prefix": "dev-lb",
    "route_table_name": "dev-lb"
}

private_app_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.16.0/22", "10.121.20.0/22", "10.121.24.0/22"],
    "subnets_name_prefix": "dev-app",
    "route_table_name": "dev-app"
}

##Private Data Subnets
private_data_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.40.0/24", "10.121.41.0/24", "10.121.42.0/24"],
    "subnets_name_prefix": "dev-data",
    "route_table_name": "dev-data",
    "is_public": true,
}

##Private Services Subnets
private_services_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.254.0/26", "10.121.254.64/26", "10.121.254.128/26"],
    "subnets_name_prefix": "dev-service",
    "route_table_name": "dev-service",
}

###Public Subnets###
public_subnets = {
    "routes": [],
    "cidrs_blocks": ["10.121.0.0/24", "10.121.1.0/24", "10.121.2.0/24"],
    "subnets_name_prefix": "dev-public",
    "map_public_ip_on_launch": true,
    "route_table_name": "dev-public"
}

instance_type = "t2.micro"
