# Credo Types

TypeScript type definitions for [Credo](https://credocentral.com) payment integration.  
This package provides strict, reusable type definitions to help developers integrate Credo payments with better type safety and IntelliSense support.

Check out the [Official Credo Payment Integration Docs](https://docs.credocentral.com).

---

## Features

- Strongly typed payloads for Credo payment initialization
- Support for **FeeBearer**, **Currency**, **PaymentChannel**, and metadata structures
- Works with any TypeScript-based project
- Lightweight – no runtime code, types only

---

## Installation

Install as a **dev dependency**:

```bash
npm install -D credo-types
```

or using Yarn:

```bash
yarn add -D credo-types
```

## Types Included

- `CredoPaymentInitializationPayload` – Main payload structure for payment requests.
- `FeeBearer` – Who pays the transaction fee (Customer or Merchant).
- `Currency` – Supported currencies (NGN, USD).
- `PaymentChannel` – Supported payment channels.
- `MetaData`, `SplitConfiguration`, etc.

## Why Use This Package?

- Avoid guesswork when building payloads
- Get IntelliSense in VSCode and other editors
- Minimize runtime errors caused by incorrect payloads

## Contributing

Contributions are welcome!
If you notice missing fields or updates in Credo's API, please open a PR or create an issue.

## License

MIT License.
Use freely in personal and commercial projects.
