# credo-types

TypeScript types for the [Credo](https://credocentral.com) payment gateway — request bodies, API responses,
the inline popup (`CredoWidget`), transaction statuses and webhooks.

Types only: no runtime code, nothing added to your bundle. Not an official Credo package — see the
[Credo docs](https://docs.credocentral.com) for the API itself.

## Install

```bash
npm install -D credo-types
```

## Use

### Redirect flow — start a transaction on your server

```ts
import type { InitializeTransactionRequest, InitializeTransactionResponse } from "credo-types";

const body = {
  amount: 2_800_000, // kobo — ₦28,000
  email: "ada@example.com",
  currency: "NGN",
  reference: "ORDER123", // your own, alphanumeric
  callbackUrl: "https://yoursite.com/success?reference=ORDER123",
  bearer: 0, // customer pays the fee
  channels: ["CARD", "BANK"],
} satisfies InitializeTransactionRequest;

const res = await fetch("https://api.credodemo.com/transaction/initialize", {
  method: "POST",
  headers: { Authorization: process.env.CREDO_PUBLIC_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const { data } = (await res.json()) as InitializeTransactionResponse;
if (data !== "") redirect(data.authorizationUrl);
```

### Inline popup — type the `CredoWidget` global

```ts
import type { CredoWidget } from "credo-types";

declare global {
  interface Window {
    CredoWidget?: CredoWidget;
  }
}

window.CredoWidget!.setup({
  key: process.env.NEXT_PUBLIC_CREDO_PUBLIC_KEY!,
  email: "ada@example.com",
  amount: 2_800_000,
  reference: "ORDER123",
  callbackUrl: "https://yoursite.com/success?reference=ORDER123",
  onClose: () => console.log("cancelled"),
  callBack: () => {
    // Don't trust this — verify on your server by your own reference.
  },
}).openIframe();
```

### Verify on your server

```ts
import type { VerifyTransactionResponse } from "credo-types";

const res = await fetch(`https://api.credodemo.com/transaction/${reference}/verify`, {
  headers: { Authorization: process.env.CREDO_SECRET_KEY! },
});
const body = (await res.json()) as VerifyTransactionResponse;
const paid = body.data !== "" && body.data.status === 0; // 0 is the only "paid" status
```

### Webhooks

```ts
import type { WebhookPayload } from "credo-types";

const { event, data } = (await request.json()) as WebhookPayload;
// Check X-Credo-Signature first: sha512(secretKey + data.businessCode), hex.
if (event === "transaction.successful") fulfil(data.businessRef);
```

## What's included

| Type | For |
| --- | --- |
| `InitializeTransactionRequest` | Body of `POST /transaction/initialize` |
| `InitializeTransactionResponse` | Its response (`authorizationUrl`, `credoReference`, …) |
| `VerifyTransactionResponse`, `TransactionDetails` | `GET /transaction/{reference}/verify` |
| `TransactionStatus` | Status codes — `0` is the only paid status |
| `CredoWidget`, `CredoWidgetOptions`, `CredoWidgetHandler` | The inline popup from `inline.js` |
| `WebhookPayload`, `WebhookEvent` | Webhook bodies |
| `Currency`, `FeeBearer`, `PaymentChannel`, `Metadata`, `SplitConfiguration` | Building blocks |

## Gotchas the types encode

- `amount` in requests is in **kobo**; amounts in responses are in **naira**.
- The field is `channels` (plural). Leave it out to offer every method enabled for your business:

  | `channels` | Customer sees |
  | --- | --- |
  | `"CARD"` | Pay with Card |
  | `"BANK"` | Pay with Transfer |
  | `"USSD"` | Pay with USSD |
  | `"WALLET"` | Pay with PocketMoni |
  | `"OPAY"` | Pay with OPay |
  | `"PAYOUTLET"` | Pay in Bank Branch |

- `serviceCode` and `splitConfiguration` can't be sent together.
- Verify returns your `customFields` as `metadata: [{ insightTag, insightTagValue, insightTagDisplay }]`.
- Error responses have `data: ""`; `error` is a string, or an object of field → message for validation errors.
- `channels` (what you offer) isn't `paymentMethod` (what the customer used — `"Card"`, `"Bank Transfer"`,
  `"USSD"`, `"Invoice"`, `"POS"`, `"Payoutlet"`, …). Compare `paymentMethod` case-insensitively.
- `channelId` in verify/webhooks is where the payment came from: `0` gateway, `1` payment link, `2` invoice, `3` POS.
- The popup's `callBack` payload varies by payment method — every field is optional.

## Upgrading from 1.x

- `channel` → `channels`, with values `"CARD"`, `"BANK"`, `"USSD"`, `"WALLET"`, `"OPAY"`, `"PAYOUTLET"`.
- `FeeBearerEnum` is gone (it crashed at runtime — there's no JavaScript in this package). Use `0` / `1` with the `FeeBearer` type.
- `CredoPaymentInitializationPayload` still works but is deprecated — use `InitializeTransactionRequest`.

## Contributing

Spotted a field that's missing or wrong? Open an issue or PR. `npm test` type-checks `test/types.test.ts`,
which uses real sandbox payloads.

## License

MIT
