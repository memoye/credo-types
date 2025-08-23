export declare const FeeBearerEnum: {
  readonly Customer: 0;
  readonly Merchant: 1;
};

export type FeeBearer = (typeof FeeBearerEnum)[keyof typeof FeeBearerEnum];
export type Currency = "NGN" | "USD";
export type PaymentChannel =
  | "Card"
  | "bank"
  | "USSD"
  | "QR"
  | "mobile_money"
  | "bank_transfer";

export type MetaData = {
  /**
   * This is a list of custom fields to be associated with the transaction.
   *
   * These will be shown on your Credo dashboard
   */
  customFields?: {
    variable_name: string;
    value: unknown;
    display_name: string;
  }[];
};

export type SplitConfiguration = Array<{
  /**
   * The ID of the account to split the payment to.
   * This is a concatenated string of the bank code and account number (e.g., "0441234567890").
   */
  accountId: string;
  /**
   * The type of split. (Refer to Credo documentation for specific values).
   * - `0`: Percentage,
   * - `1`: Flat amount
   */
  splitType: number;
  splitValue: number;
  /**
   * Indicates if this is the default split.
   * - `0`: Not default.
   * - `1`: Is default.
   */
  isDefault: 0 | 1;
}>;

interface BaseCredoPaymentRequestCommon {
  /**
   * The amount to be paid (in the lowest currency unit ie. kobo for NGN, cents for USD, etc.)
   */
  amount: number;
  /**
   * The email address of the customer
   */
  email: string;
  customerPhoneNumber?: string;
  customerFirstName?: string;
  customerLastName?: string;
  /**
   * The currency of the transaction.
   * @default NGN
   */
  currency: Currency;
  /**
   * A unique, case-sensitive transaction reference. Only alphanumeric characters are allowed.
   *
   * If you don't provide this parameter, Credo will automatically generate a unique reference for the transaction.
   */
  reference?: string;
  /**
   * If provided, After a payment attempt, we'll redirect the customer to this URL.
   */
  callbackUrl?: string;
  /**
   * The possible payment channels for the transaction.
   */
  channel: PaymentChannel[];
  bearer: FeeBearer;
  /**
   * Additional metadata to be associated with the transaction.
   */
  metadata?: MetaData;
  narration?: string;
  /**
   * Specifies if the gateway should generate
   * a virtual bank account number for the transaction.
   *
   * Options:
   * - `0`: Do not initialize a virtual account (default).
   * - `1`: Initialize a virtual account.
   * @default 0
   *
   * @remarks
   * **Note:** Webhook implementation is required for this feature to work correctly.
   * @see {@link https://docs.credocentral.com/guides/webhooks/overview | Webhook Integration Guide}
   */
  initializeAccount: 0 | 1;
  /**
   * Enables merchants to temporarily halt the settlement process
   * within the escrow system.
   *
   * Options:
   * - `0`: Do not pause the settlement (default).
   * - `1`: Pause the settlement.
   * @default 0
   */
  pauseSettlement?: 0 | 1;
  /**
   * Defines the effective date for the settlement of a pause transaction.
   * Format - `yyyy-MM-dd`
   */
  pauseSettlementDate?: string;
}

interface PreConfiguredSplit {
  /**
   * The service code to be used for the transaction (Pre-Configured Split Settlement).
   * This code can be copied from the Credo dashboard.
   *
   * ---
   * ⚠️IMPORTANT: Make sure **Client-side dynamic settlement** is enabled for your account.
   *
   * Contact Credo Support {@link :(help@credocentral.com)} to enable this feature.
   */
  serviceCode: string;
  splitConfiguration?: never;
}

interface PostConfiguredSplit {
  /**
   * Configure the split settlement rules at the time of the transaction (Post-Configured Settlement).
   *
   * **⚠️ NOTE**
   * - At least one split must be set as the default (`isDefault: 1`).
   * - At least one split must be of type 0 (Percentage).
   * - There must be one percentage split (type 0) with a value of 100 to account for the remaining amount.
   *
   * ---
   * ⚠️IMPORTANT: Make sure **Client-side dynamic settlement** is enabled for your account.
   *
   * Contact Credo Support ({@link :help@credocentral.com}) to enable this feature.
   */
  splitConfiguration: SplitConfiguration;
  serviceCode?: never;
}

interface NoSplitConfiguration {
  serviceCode?: never;
  splitConfiguration?: never;
}

/**
 * Credo Payment Initialization Payload.
 */
export type CredoPaymentInitializationPayload = BaseCredoPaymentRequestCommon &
  (PreConfiguredSplit | PostConfiguredSplit | NoSplitConfiguration);
