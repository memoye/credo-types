// Type definitions for the Credo payment gateway (https://docs.credocentral.com).
// Types only — this package ships no runtime code.

/* -------------------------------------------------------------------------- */
/*                                   Shared                                   */
/* -------------------------------------------------------------------------- */

export type Currency = "NGN" | "USD";

/**
 * Who pays Credo's transaction fee.
 * - `0`: the customer (the fee is added to their total)
 * - `1`: the merchant (the fee is taken from the settlement)
 */
export type FeeBearer = 0 | 1;

/** Payment methods to offer at checkout. */
export type PaymentChannel = "CARD" | "BANK";

/** `0` = no, `1` = yes. */
export type BinaryFlag = 0 | 1;

export type MetadataField = {
  variable_name: string;
  value: unknown;
  display_name: string;
};

export type Metadata = {
  /** Structured key/value pairs. Shown on your Credo dashboard and returned in verify/webhook payloads. */
  customFields?: MetadataField[];
  [key: string]: unknown;
};

export type SplitConfigurationItem = {
  /** Bank code + account number concatenated, e.g. `"0441234567890"`. */
  accountId: string;
  /**
   * - `0`: Percentage
   * - `1`: Flat amount
   */
  splitType: 0 | 1;
  splitValue: number;
  /** Exactly one split should be the default (`1`). */
  isDefault: BinaryFlag;
};

export type SplitConfiguration = SplitConfigurationItem[];

/* -------------------------------------------------------------------------- */
/*                    Initialize (POST /transaction/initialize)               */
/* -------------------------------------------------------------------------- */

interface TransactionFields {
  /**
   * Amount in the **lowest currency unit** — kobo for NGN, cents for USD.
   * `150000` = ₦1,500.
   */
  amount: number;
  /** Customer's email address. */
  email: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhoneNumber?: string;
  /** @default "NGN" */
  currency?: Currency;
  /**
   * Your own unique reference for this transaction. **Alphanumeric only.**
   * Credo generates one if omitted. You can verify a transaction by this reference.
   */
  reference?: string;
  /** Where Credo sends the customer after a payment attempt. */
  callbackUrl?: string;
  /** Payment methods to show. All enabled methods are shown if omitted. */
  channels?: PaymentChannel[];
  /** Who pays the fee. If omitted, Credo applies your account's default. */
  bearer?: FeeBearer;
  /** Your own order data. Returned in verify responses and webhooks. */
  metadata?: Metadata;
  narration?: string;
  /**
   * Generate a dedicated virtual account for bank transfer.
   * Requires webhooks to confirm the transfer.
   * @default 0
   */
  initializeAccount?: BinaryFlag;
  /**
   * Hold settlement in escrow.
   * @default 0
   */
  pauseSettlement?: BinaryFlag;
  /** When a paused settlement should be released. Format `yyyy-MM-dd`. */
  pauseSettlementDate?: string;
}

interface PreConfiguredSplit {
  /**
   * Pre-configured split settlement code, copied from your Credo dashboard.
   * Dynamic settlement must be enabled on your account (help@credocentral.com).
   */
  serviceCode: string;
  splitConfiguration?: never;
}

interface PostConfiguredSplit {
  /**
   * Split rules for this transaction only.
   * - At least one split must be the default (`isDefault: 1`).
   * - Include a percentage split (`splitType: 0`) of `100` to take the remainder.
   *
   * Dynamic settlement must be enabled on your account (help@credocentral.com).
   */
  splitConfiguration: SplitConfiguration;
  serviceCode?: never;
}

interface NoSplit {
  serviceCode?: never;
  splitConfiguration?: never;
}

export type SplitOptions = PreConfiguredSplit | PostConfiguredSplit | NoSplit;

/**
 * Body for `POST /transaction/initialize`.
 * Send it from your server with your **public key** as the `Authorization` header.
 */
export type InitializeTransactionRequest = TransactionFields & SplitOptions;

/** @deprecated Renamed to {@link InitializeTransactionRequest}. */
export type CredoPaymentInitializationPayload = InitializeTransactionRequest;

/* -------------------------------------------------------------------------- */
/*                               API responses                                */
/* -------------------------------------------------------------------------- */

/** Envelope Credo wraps every API response in. */
export interface CredoResponse<T> {
  /** HTTP-style status, e.g. `200`, `404`. */
  status: number;
  message: string;
  /** The payload. An empty string on errors. */
  data: T | "";
  execTime: number;
  /** An array on success (usually empty); a message string on some errors. */
  error: string[] | string;
}

export interface InitializeTransactionData {
  /** Send the customer here to pay (redirect flow). */
  authorizationUrl: string;
  /** Your reference (or the one Credo generated). */
  reference: string;
  /** Credo's transaction reference (`transRef`). */
  credoReference: string;
  /** Credo Reference Number. */
  crn: string;
  /** Amount the customer will be charged, in **major units** (naira, not kobo). */
  debitAmount?: number;
  /** Credo's fee, in major units. */
  fee?: number;
  /** Amount the merchant receives, in major units. */
  amount?: number;
}

export type InitializeTransactionResponse = CredoResponse<InitializeTransactionData>;

/**
 * Transaction status codes. Only `0` means the customer has paid.
 *
 * | Code | Meaning |
 * |---|---|
 * | `0` | Successful |
 * | `1` | Refunded |
 * | `2` | Queued for refund |
 * | `3` | Failed |
 * | `4` | Queued for settlement |
 * | `5` | Settled |
 * | `6` | Flagged for review |
 * | `7` | Declined (fraud check) |
 * | `9` | Cancelled by customer |
 * | `10` | Cancelled by merchant |
 * | `12` | Account generated, awaiting credit |
 * | `13` | Customer attempted payment |
 * | `14` | Payment page loaded |
 * | `15` | Payment URL generated |
 */
export type TransactionStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10 | 12 | 13 | 14 | 15;

/** All amounts are in **major units** (naira, not kobo). */
export interface TransactionDetails {
  /** Credo's transaction reference. */
  transRef: string;
  /** Your reference. */
  businessRef: string;
  /** What the customer was charged. */
  debitedAmount: number;
  /** The transaction amount. */
  transAmount: number;
  /** Credo's fee. */
  transFeeAmount: number;
  /** What the merchant receives. */
  settlementAmount: number;
  /** The customer's email. */
  customerId: string;
  transactionDate: string;
  currencyCode: Currency;
  /** `0` means paid. See {@link TransactionStatus}. */
  status: TransactionStatus;
  /** Human-readable status, e.g. `"Successful"` or `"Not processed yet"`. */
  statusMessage?: string;
  businessName?: string;
  businessCode?: string;
  channelId?: number;
  /** Credo Reference Number. */
  crn?: string;
  customerFirstName?: string;
  customerLastName?: string;
  /**
   * Your `metadata.customFields`, as Credo returns them — note the different shape:
   * `variable_name` → `insightTag`, `value` → `insightTagValue`, `display_name` → `insightTagDisplay`.
   */
  metadata?: TransactionMetadataItem[];
}

/** One of your `customFields`, as returned by verify. */
export interface TransactionMetadataItem {
  insightTag: string;
  insightTagValue: string;
  insightTagDisplay: string;
}

/**
 * Response of `GET /transaction/{reference}/verify`.
 * Call it from your server with your **secret key** as the `Authorization` header.
 * Accepts Credo's `transRef` or your own `reference`.
 */
export type VerifyTransactionResponse = CredoResponse<TransactionDetails>;

/* -------------------------------------------------------------------------- */
/*                         Inline popup (CredoWidget)                         */
/* -------------------------------------------------------------------------- */

/**
 * What `callBack` receives. The shape depends on the payment method, so treat every
 * field as optional — and never fulfil an order from it. Verify on your server instead
 * (by the `reference` you passed in).
 */
export interface CredoWidgetCallbackResponse {
  transRef?: string;
  reference?: string;
  callbackUrl?: string;
  [key: string]: unknown;
}

type WidgetAuth =
  | {
      /** Your **public** key — `0PUB…` (sandbox) or `1PUB…` (live). */
      key: string;
      paymentLink?: never;
    }
  | {
      /** A pre-generated payment link, instead of `key`. */
      paymentLink: string;
      key?: never;
    };

/**
 * Options for `CredoWidget.setup()`. Everything except `key` and the two callbacks
 * is sent to `/transaction/initialize`, so the same fields apply.
 */
export type CredoWidgetOptions = TransactionFields &
  SplitOptions &
  WidgetAuth & {
    /** Where the customer is sent after paying. */
    callbackUrl: string;
    /** The customer closed or cancelled the popup without paying. */
    onClose: () => void;
    /** The popup flow finished. Verify on your server before fulfilling. */
    callBack: (response: CredoWidgetCallbackResponse) => void;
  };

export interface CredoWidgetHandler {
  /** Open checkout in a popup on top of the page. */
  openIframe(): void;
  /** Send the customer to Credo's hosted payment page instead. */
  redirect(url?: string): void;
}

/**
 * The `CredoWidget` global added by Credo's `inline.js`.
 *
 * Make it available on `window`:
 * ```ts
 * import type { CredoWidget } from "credo-types";
 * declare global {
 *   interface Window { CredoWidget?: CredoWidget }
 * }
 * ```
 */
export interface CredoWidget {
  setup(options: CredoWidgetOptions): CredoWidgetHandler;
}

/* -------------------------------------------------------------------------- */
/*                                  Webhooks                                  */
/* -------------------------------------------------------------------------- */

export type WebhookEvent =
  | "transaction.successful"
  | "transaction.failed"
  /** A bank transfer was under- or over-paid and was reversed to the customer. */
  | "transaction.transaction.transfer.reverse"
  | "transaction.settlement.success";

export interface WebhookTransactionData extends Omit<TransactionDetails, "metadata"> {
  metadata?: unknown;
  businessCode: string;
  channelId: number;
  /** e.g. `"MasterCard"`, `"Visa"`. */
  paymentMethodType: string;
  /** e.g. `"Card"`, `"Bank"`. */
  paymentMethod: string;
  customer: {
    customerEmail: string;
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
  };
}

/**
 * Body Credo POSTs to your webhook URL.
 *
 * Verify the `X-Credo-Signature` header first: it is the hex SHA-512 of
 * `secretKey + data.businessCode`. Respond `200` within 5 seconds.
 */
export interface WebhookPayload {
  event: WebhookEvent;
  data: WebhookTransactionData;
}
