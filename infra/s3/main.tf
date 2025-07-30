resource "aws_s3_bucket" "docker_backup" {
  bucket = var.s3_bucket_name
  acl    = "private"
  tags = {
    Name        = "IDLMS Docker Backup"
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "docker_backup_block" {
  bucket = aws_s3_bucket.docker_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



resource "aws_s3_bucket_versioning" "docker_backup_versioning" {
  bucket = aws_s3_bucket.docker_backup.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}
