// Type tests: `npm test` type-checks this file. Nothing here runs.
// ✅ blocks are real payloads/responses from the Credo sandbox; ❌ blocks must fail.
import type {
  CredoWidget,
  CredoWidgetOptions,
  InitializeTransactionRequest,
  InitializeTransactionResponse,
  TransactionDetails,
  VerifyTransactionResponse,
  WebhookPayload,
  PaymentMethod,
} from "../index";

/* ------------------------------ initialize ------------------------------ */

// ✅ A redirect-flow body Credo accepted.
export const initializeBody = {
  amount: 2_800_000,
  currency: "NGN",
  email: "ada@example.com",
  customerFirstName: "Ada",
  customerLastName: "Lovelace",
  reference: "DEMO1794455635455249",
  callbackUrl: "https://example.com/success?reference=DEMO1794455635455249",
  bearer: 0,
  channels: ["CARD", "BANK"],
  metadata: { customFields: [{ variable_name: "size", value: "M", display_name: "Size" }] },
} satisfies InitializeTransactionRequest;

// ✅ Minimal body — channels, bearer and initializeAccount are optional.
export const minimal = { amount: 10_000, email: "a@b.co" } satisfies InitializeTransactionRequest;

// ✅ Splits: a service code, or an explicit configuration.
export const withServiceCode = { amount: 1, email: "a@b.co", serviceCode: "SC1" } satisfies InitializeTransactionRequest;
export const withSplit = {
  amount: 1,
  email: "a@b.co",
  splitConfiguration: [{ accountId: "0441234567890", splitType: 0, splitValue: 100, isDefault: 1 }],
} satisfies InitializeTransactionRequest;

// ✅ Every channel Credo's checkout supports.
export const allChannels = {
  amount: 1,
  email: "a@b.co",
  channels: ["CARD", "BANK", "USSD", "WALLET", "OPAY", "PAYOUTLET"],
} satisfies InitializeTransactionRequest;

// ❌ Admin-side processor types aren't checkout channels — Credo rejects them.
// @ts-expect-error — "POS" isn't a payment channel
export const posChannel = { amount: 1, email: "a@b.co", channels: ["POS"] } satisfies InitializeTransactionRequest;

// ❌ The 1.x field name.
// @ts-expect-error — it's `channels`, not `channel`
export const wrongChannelKey = { amount: 1, email: "a@b.co", channel: ["CARD"] } satisfies InitializeTransactionRequest;

// ❌ Wrong channel casing.
// @ts-expect-error — channels are "CARD" | "BANK"
export const wrongChannelCase = { amount: 1, email: "a@b.co", channels: ["Card"] } satisfies InitializeTransactionRequest;

// ❌ bearer must be 0 or 1.
// @ts-expect-error — bearer is 0 | 1
export const badBearer = { amount: 1, email: "a@b.co", bearer: 2 } satisfies InitializeTransactionRequest;

// ❌ Can't send both split styles.
// @ts-expect-error — serviceCode and splitConfiguration are mutually exclusive
export const bothSplits = { amount: 1, email: "a@b.co", serviceCode: "SC1", splitConfiguration: [] } satisfies InitializeTransactionRequest;

// ✅ Real initialize response.
export const initializeResponse = {
  status: 200,
  message: "Successfully processed",
  data: {
    authorizationUrl: "https://pay.credodemo.com/v4/ckQ900xgZR23ax0C78ac",
    reference: "DEMOTEST1794451400",
    credoReference: "ckQ900xgZR23ax0C78ac",
    crn: "000000298468",
    debitAmount: 101.5,
    fee: 1.5,
    amount: 100.0,
  },
  execTime: 35,
  error: [],
} satisfies InitializeTransactionResponse;

// ✅ Real validation error — `error` is an object of field → message.
export const invalidChannel = {
  status: 400,
  message: "There was an error with the information you provided. Please review your input and try again.",
  data: "",
  execTime: 0,
  error: { channels: "Channels list contains an invalid/disabled channel!" },
} satisfies InitializeTransactionResponse;

/* -------------------------------- verify -------------------------------- */

// ✅ Real verify response for a paid order.
export const verifyPaid = {
  status: 200,
  message: "Successfully processed",
  data: {
    businessName: "Common thread",
    businessCode: "700607008600006",
    transRef: "U9Kz00MaSn23GYbk78x9",
    businessRef: "DEMO1794455635455249",
    debitedAmount: 56100.0,
    transAmount: 56000.0,
    transFeeAmount: 940.0,
    settlementAmount: 55160.0,
    customerId: "ada@example.com",
    transactionDate: "2026-11-12 03:54:14",
    channelId: 0,
    currencyCode: "NGN",
    status: 0,
    statusMessage: "Successfully processed",
    metadata: [{ insightTag: "product", insightTagValue: "Everyday Heavyweight Hoodie", insightTagDisplay: "Product" }],
    crn: "000000298500",
    customerFirstName: "Ada",
    customerLastName: "Lovelace",
  },
  execTime: 12,
  error: [],
} satisfies VerifyTransactionResponse;

// ✅ Real "not found" response — data is "" and error is a string.
export const verifyNotFound = {
  status: 404,
  message: "Transaction with ref# abc123 not found",
  data: "",
  execTime: 0,
  error: "Transaction with ref# abc123 not found",
} satisfies VerifyTransactionResponse;

// ✅ Narrowing: the only paid status is 0.
export function isPaid(res: VerifyTransactionResponse): res is VerifyTransactionResponse & { data: TransactionDetails } {
  return res.data !== "" && res.data.status === 0;
}

// ❌ 8 and 11 aren't Credo statuses.
// @ts-expect-error — not a TransactionStatus
export const badStatus: TransactionDetails["status"] = 8;

// ❌ channelId is 0–3.
// @ts-expect-error — not a TransactionChannel
export const badChannelId: TransactionDetails["channelId"] = 4;

/* --------------------------------- popup -------------------------------- */

declare const CredoWidget: CredoWidget;

// ✅ The popup options our demo passes.
export const handler = CredoWidget.setup({
  key: "0PUBxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  email: "ada@example.com",
  customerFirstName: "Ada",
  customerLastName: "Lovelace",
  amount: 2_800_000,
  currency: "NGN",
  bearer: 1,
  reference: "DEMO124",
  callbackUrl: "https://example.com/success?reference=DEMO124",
  metadata: { customFields: [{ variable_name: "size", value: "M", display_name: "Size" }] },
  onClose: () => {},
  callBack: (response) => {
    // Every field is optional — the shape varies by payment method.
    const ref: string | undefined = response.transRef;
    void ref;
  },
});
handler.openIframe();

// ❌ Missing onClose / callBack.
// @ts-expect-error — onClose and callBack are required
export const noCallbacks = { key: "0PUB", email: "a@b.co", amount: 1, callbackUrl: "https://x" } satisfies CredoWidgetOptions;

// ❌ key and paymentLink together.
// @ts-expect-error — use key or paymentLink, not both
export const both = { key: "0PUB", paymentLink: "https://pay.credodemo.com/xyz", email: "a@b.co", amount: 1, callbackUrl: "https://x", onClose() {}, callBack() {} } satisfies CredoWidgetOptions;

/* ------------------------------- webhooks ------------------------------- */

// ✅ Webhook body from the Credo docs.
export const webhook = {
  event: "transaction.successful",
  data: {
    businessCode: "700607002190001",
    transRef: "cI9H00N2AB02Qb0s69Mj",
    businessRef: "PL1683423455304ATm",
    debitedAmount: 1000.0,
    transAmount: 1000.0,
    transFeeAmount: 15.0,
    settlementAmount: 985.0,
    customerId: "customer@example.com",
    transactionDate: "May 7, 2023, 1:37:53 AM",
    channelId: 1,
    currencyCode: "NGN",
    status: 0,
    paymentMethodType: "MasterCard",
    paymentMethod: "Card",
    customer: { customerEmail: "customer@example.com", firstName: "John", lastName: "Doe", phoneNo: "23470122199999" },
  },
} satisfies WebhookPayload;

// ✅ Known payment methods autocomplete, but other strings are still allowed.
export const methods: PaymentMethod[] = ["Card", "Bank Transfer", "USSD", "Invoice", "POS", "Payoutlet", "PocketMoni"];

// ❌ Unknown event.
// @ts-expect-error — not a WebhookEvent
export const badEvent: WebhookPayload["event"] = "payment.success";
