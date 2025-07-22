#!/bin/bash

# Function to disable all flows
disable_all_flows() {
  for dir in */; do
    if [[ -f "${dir}index.json" ]]; then
      mv "${dir}index.json" "${dir}index.0"
      echo "Disabled: ${dir}"
    fi
  done
}

# Function to enable all flows
enable_all_flows() {
  for dir in */; do
    if [[ -f "${dir}index.0" ]]; then
      mv "${dir}index.0" "${dir}index.json"
      echo "Enabled: ${dir}"
    fi
  done
}

# Function to disable a specific flow
disable_flow() {
  flow_dir="$1"
  if [[ -z "$flow_dir" ]]; then
    echo "Usage: disable_one <flow_directory>"
    return 1
  fi

  if [[ -f "${flow_dir}/index.json" ]]; then
    mv "${flow_dir}/index.json" "${flow_dir}/index.0"
    echo "Disabled: ${flow_dir}"
  else
    echo "Flow not found or already disabled: ${flow_dir}"
  fi
}

# Function to enable a specific flow
enable_flow() {
  flow_dir="$1"
  if [[ -z "$flow_dir" ]]; then
    echo "Usage: enable_one <flow_directory>"
    return 1
  fi

  if [[ -f "${flow_dir}/index.0" ]]; then
    mv "${flow_dir}/index.0" "${flow_dir}/index.json"
    echo "Enabled: ${flow_dir}"
  else
    echo "Flow not found or already enabled: ${flow_dir}"
  fi
}

# Usage message
usage() {
  echo "Usage:"
  echo "  $0 enable              # Enable all flows"
  echo "  $0 disable             # Disable all flows"
  echo "  $0 enable_one <dir>    # Enable a specific flow"
  echo "  $0 disable_one <dir>   # Disable a specific flow"
}

# Entry point
case "$1" in
  enable)
    enable_all_flows
    ;;
  disable)
    disable_all_flows
    ;;
  disable_one)
    disable_flow "$2"
    ;;
  enable_one)
    enable_flow "$2"
    ;;
  *)
    usage
    ;;
esac

