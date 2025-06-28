output "docker_backup_bucket_name" {
  description = "Name of the Docker backup S3 bucket"
  value       = aws_s3_bucket.docker_backup.id
}

