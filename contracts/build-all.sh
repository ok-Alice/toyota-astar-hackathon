#!/usr/bin/env bash

set -eu

cargo +nightly contract build --manifest-path governor/Cargo.toml
cargo +nightly contract build --manifest-path assignments/Cargo.toml
cargo +nightly contract build --manifest-path employee/Cargo.toml
