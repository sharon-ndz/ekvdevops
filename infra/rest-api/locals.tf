locals {
  nlb_dns_name = data.terraform_remote_state.nlb.outputs.nlb_dns_name
  vpc_link_target_arns = [data.terraform_remote_state.nlb.outputs.nlb_arn]
}
