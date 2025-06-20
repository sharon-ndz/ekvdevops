output "api_gateway_stage_arn" {
  value       = data.terraform_remote_state.api.outputs.api_stage_arn
}

