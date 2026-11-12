# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-11-12

### Breaking

- `channel` renamed to `channels`, and `PaymentChannel` is now `"CARD" | "BANK"` (what the API accepts).
- Removed `FeeBearerEnum`. It was declared as a value but the package ships no JavaScript, so importing it
  crashed at runtime. Use the `FeeBearer` type (`0 | 1`).
- `channels`, `bearer`, `currency` and `initializeAccount` are now optional — Credo accepts requests without them.

### Added

- `InitializeTransactionResponse`, `VerifyTransactionResponse`, `TransactionDetails` and the `CredoResponse` envelope.
- `TransactionStatus` with every documented status code.
- Inline popup types: `CredoWidget`, `CredoWidgetOptions`, `CredoWidgetHandler`, `CredoWidgetCallbackResponse`.
- Webhook types: `WebhookPayload`, `WebhookEvent`, `WebhookTransactionData`.
- Type tests built from real sandbox payloads (`npm test`).

### Changed

- `CredoPaymentInitializationPayload` is now a deprecated alias of `InitializeTransactionRequest`.
- `SplitConfigurationItem.splitType` is `0 | 1`.

## [1.0.0] - 2025-08-23

### Added

- Initial release
- Type definitions for Credo payment initialization
- Support for fee bearer, currency, and payment channel types
- Split payment configuration types
- Metadata structure types
