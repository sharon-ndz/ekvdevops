resource "aws_ecr_repository" "license_api" {
  name = "license-api-${var.environment}"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Environment = var.environment
    App         = "license-api"
  }
}

