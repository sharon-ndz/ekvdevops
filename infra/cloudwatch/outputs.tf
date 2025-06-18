output "nlb_logs_bucket" {
  description = "S3 bucket used to store NLB access logs"
  value       = aws_s3_bucket.nlb_logs.bucket
}

