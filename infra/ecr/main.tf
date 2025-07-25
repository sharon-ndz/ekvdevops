module "ecr_license_api" {
  source              = "../terraform-modules/ecr"
  name                 = "license-api-${var.environment}"
  image_tag_mutability = var.image_tag_mutability
  scan_on_push         = var.scan_on_push
  encryption_type      = var.encryption_type

  tags = {
    Environment = var.environment
    App         = "license-api"
  }
}
