# locals.tf
locals {
  nlb_dns = data.terraform_remote_state.nlb.outputs.nlb_dns_name

  api_routes = {
    for path, port in var.path_to_port_map :
    path => "http://${local.nlb_dns}:${port}/{proxy}"
  }
}

