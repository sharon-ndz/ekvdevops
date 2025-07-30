resource "aws_s3_bucket" "docker_backup" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "IDLMS Docker Backup"
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ✅ Proper way to set bucket ACL to private
resource "aws_s3_bucket_acl" "docker_backup_acl" {
  bucket = aws_s3_bucket.docker_backup.id
  acl    = "private"
}

# ✅ Correct public access block configuration
resource "aws_s3_bucket_public_access_block" "docker_backup_block" {
  bucket = aws_s3_bucket.docker_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ✅ Optional: versioning
resource "aws_s3_bucket_versioning" "docker_backup_versioning" {
  bucket = aws_s3_bucket.docker_backup.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}
