vpc_name           = "dev-idlms-lambda-vpc"
cidr_block         = "10.0.0.0/16"

public_subnets = [
  {
    cidr_block = "10.0.1.0/24"
    az         = "eu-west-1a"
  },
  {
    cidr_block = "10.0.2.0/24"
    az         = "eu-west-1b"
  }
]

private_subnets = [
  {
    cidr_block = "10.0.3.0/24"
    az         = "eu-west-1a"
  },
  {
    cidr_block = "10.0.4.0/24"
    az         = "eu-west-1b"
  }
]


tags = {
  Project = "dev-idlms"
  Owner   = "idlms"
}

