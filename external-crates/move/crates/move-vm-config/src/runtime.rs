// Copyright (c) The Move Contributors
// SPDX-License-Identifier: Apache-2.0

use crate::verifier::{VerifierConfig, DEFAULT_MAX_CONSTANT_VECTOR_LEN};
use move_binary_format::file_format_common::VERSION_MAX;
use once_cell::sync::Lazy;
use std::path::PathBuf;

#[cfg(feature = "gas-profiler")]
const MOVE_VM_PROFILER_ENV_VAR_NAME: &str = "MOVE_VM_PROFILE";

#[cfg(feature = "gas-profiler")]
static PROFILER_ENABLED: Lazy<bool> =
    Lazy::new(|| std::env::var(MOVE_VM_PROFILER_ENV_VAR_NAME).is_ok());

pub const DEFAULT_MAX_VALUE_NEST_DEPTH: u64 = 128;

pub static DEFAULT_PROFILE_OUTPUT_PATH: Lazy<PathBuf> = Lazy::new(|| std::path::PathBuf::from("."));

/// Dynamic config options for the Move VM.
pub struct VMConfig {
    pub verifier: VerifierConfig,
    pub max_binary_format_version: u32,
    pub runtime_limits_config: VMRuntimeLimitsConfig,
    // When this flag is set to true, MoveVM will check invariant violation in swap_loc
    pub enable_invariant_violation_check_in_swap_loc: bool,
    // When this flag is set to true, MoveVM will check that there are no trailing bytes after
    // deserializing and check for no metadata bytes
    pub check_no_extraneous_bytes_during_deserialization: bool,
    // Configs for profiling VM
    #[cfg(feature = "gas-profiler")]
    pub profiler_config: Option<VMProfilerConfig>,
    // When this flag is set to true, errors from the VM will be augmented with execution state
    // (stacktrace etc.)
    pub error_execution_state: bool,
}

impl Default for VMConfig {
    fn default() -> Self {
        Self {
            verifier: VerifierConfig::default(),
            max_binary_format_version: VERSION_MAX,
            runtime_limits_config: VMRuntimeLimitsConfig::default(),
            enable_invariant_violation_check_in_swap_loc: true,
            check_no_extraneous_bytes_during_deserialization: false,
            #[cfg(feature = "gas-profiler")]
            profiler_config: None,
            error_execution_state: true,
        }
    }
}

#[derive(Clone, Debug)]
pub struct VMRuntimeLimitsConfig {
    /// Maximum number of items that can be pushed into a vec
    pub vector_len_max: u64,
    /// Maximum value nest depth for structs
    pub max_value_nest_depth: Option<u64>,
    // include hardened OTW checks
    pub hardened_otw_check: bool,
}

impl Default for VMRuntimeLimitsConfig {
    fn default() -> Self {
        Self {
            vector_len_max: DEFAULT_MAX_CONSTANT_VECTOR_LEN,
            max_value_nest_depth: Some(DEFAULT_MAX_VALUE_NEST_DEPTH),
            hardened_otw_check: true,
        }
    }
}

#[cfg(feature = "gas-profiler")]
#[derive(Clone, Debug)]
pub struct VMProfilerConfig {
    /// User configured full path override
    pub full_path: Option<std::path::PathBuf>,
    /// Whether or not to track bytecode instructions
    pub track_bytecode_instructions: bool,
    /// Whether or not to use the long name for functions
    pub use_long_function_name: bool,
}

#[cfg(feature = "gas-profiler")]
impl VMProfilerConfig {
    pub fn get_default_config_if_enabled() -> Option<VMProfilerConfig> {
        if *PROFILER_ENABLED {
            Some(VMProfilerConfig::default())
        } else {
            None
        }
    }
}

#[cfg(feature = "gas-profiler")]
impl std::default::Default for VMProfilerConfig {
    fn default() -> Self {
        Self {
            full_path: None,
            track_bytecode_instructions: false,
            use_long_function_name: false,
        }
    }
}
