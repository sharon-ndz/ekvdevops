vpc_name           = "prod-idlms-lambda-vpc"                               cidr_block         = "10.0.0.0/16"

public_subnets = [
  {
    cidr_block = "10.0.1.0/24"
    az         = "us-east-1a"
  },
  {
    cidr_block = "10.0.2.0/24"
    az         = "us-east-1b"
  }
]

private_subnets = [
  {
    cidr_block = "10.0.3.0/24"
    az         = "us-east-1a"
  },
  {
    cidr_block = "10.0.4.0/24"
    az         = "us-east-1b"
  }
]

enable_nat_gateway = true

tags = {
  Project = "prod-idlms"
  Owner   = "idlms"
}


