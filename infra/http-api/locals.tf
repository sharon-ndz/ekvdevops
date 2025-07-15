locals {
  api_routes = {
    for path, port in var.path_to_port_map :
    path => data.terraform_remote_state.nlb.outputs.nlb_listener_arns[port]
  }
}
