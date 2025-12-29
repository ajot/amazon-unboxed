# Unboxed - Your Amazon year in review.

Turn your Amazon order history into a Spotify Wrapped–style recap. See what you bought, how much you spent, your busiest and most expensive months, number of orders and returns.

**Privacy-first**: All processing happens entirely in your browser — no accounts, no uploads, no servers, no tracking. Your data is stored locally in browser storage so reloads don't require re-uploading files.

**Try it**: [unboxed.curiousmints.com](https://unboxed.curiousmints.com) (includes demo data to explore)

## Features

- **Wrapped Slideshow**: Animated slides showing your year in review
  - Total spending & refunds
  - Order counts & frequency
  - Peak shopping month
  - Favorite shopping day
  - Top purchased items
  - Biggest purchases
  - Digital content stats
  - Returns summary

- **Explore Dashboard**: Dig into everything with charts and tables
  - All transactions (searchable, sortable)
  - Monthly spending charts
  - Books breakdown (Kindle, Audible, physical)
  - Refunds history

- **Share**: Download slides as images to share on social media

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion (animations)
- Chart.js (charts in Explore mode)
- Papa Parse (CSV parsing)
- html-to-image (slide downloads)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## How to Get Your Amazon Data

1. Go to [Amazon Privacy Central](https://www.amazon.com/hz/privacy-central/data-requests/preview.html)
2. Click **"Request Your Data"**
3. Select **"Your Orders"**
4. Wait for Amazon's email (usually a few hours to a couple of days)
5. Download and unzip the file
6. Upload the CSV files — the app auto-detects which is which

### Which Files Do You Need?

The app uses **3 types of files** from the Amazon export:

| Folder | What It Contains | Required? |
|--------|------------------|:---------:|
| `Retail.OrderHistory.1/` | Your retail order history | **Yes** |
| `Digital-Ordering.1/` | Kindle books, apps, digital purchases | Optional |
| `Retail.OrdersReturned.Payments.1/` | Your refund records | Optional |

**Pro tip:** You can upload all CSV files from the zip — the app auto-detects which is which and ignores files it doesn't recognize.

---

## Amazon Data Export Reference

This section documents the complete structure of Amazon's data export for developers and contributors.

### Complete Export File Structure

When you request your data from Amazon, you receive a ZIP containing these folders:

| Folder | Description | Used by App |
|--------|-------------|:-----------:|
| `Digital-Ordering.1/` | Digital purchases (Kindle, apps, etc.) | **Yes** |
| `Digital.Borrows.1/` | Kindle Unlimited borrows | No |
| `Digital.Orders.Returns.1/` | Digital item returns | No |
| `Retail.CartItems.1/` | Items currently in cart | No |
| `Retail.CustomerReturns.1/` | Return requests | No |
| `Retail.CustomerReturns.1.1/` | Return requests (continued) | No |
| `Retail.OrderHistory.1/` | **Main order history** | **Yes** |
| `Retail.OrderHistory.2/` | Order history (continued) | **Yes** |
| `Retail.Orders.ManageYourReturns.1/` | Return management | No |
| `Retail.Orders&Returns.Concessions/` | Concessions/adjustments | No |
| `Retail.OrdersReturned.1/` | Returned orders | No |
| `Retail.OrdersReturned.Payments.1/` | **Refund payments** | **Yes** |
| `Retail.Returns.Receivable.1/` | Pending returns | No |
| `Retail.Returns.Retrocharge.1/` | Return charges | No |
| `Retail.TransactionalInvoicing.2/` | Invoices | No |
| `Sustainability.Value.Metrics.1/` | Sustainability data | No |
| `YourOrders.PhotoOnDelivery/` | Delivery photos | No |

---

### CSV Column Reference

#### Retail.OrderHistory (Retail Orders)

The main order history file. Each row represents one item in an order.

| Column | Description | Used |
|--------|-------------|:----:|
| `Website` | Amazon site (amazon.com, etc.) | No |
| `Order ID` | Unique order identifier | **Yes** |
| `Order Date` | Date order was placed | **Yes** |
| `Purchase Order Number` | PO number (if applicable) | No |
| `Currency` | Currency code (USD, etc.) | **Yes** |
| `Unit Price` | Price per unit | **Yes** |
| `Unit Price Tax` | Tax per unit | No |
| `Shipping Charge` | Shipping cost | No |
| `Total Discounts` | Discounts applied | No* |
| `Total Owed` | Total amount charged | **Yes** |
| `Shipment Item Subtotal` | Item subtotal | No |
| `Shipment Item Subtotal Tax` | Item tax | No |
| `ASIN` | Amazon product identifier | **Yes** |
| `Product Condition` | New, Used, etc. | No* |
| `Quantity` | Number of units | **Yes** |
| `Payment Instrument Type` | Payment method used | No* |
| `Order Status` | Order status | No |
| `Shipment Status` | Shipping status | No |
| `Ship Date` | Date shipped | No* |
| `Shipping Option` | Delivery speed (Prime, etc.) | No* |
| `Shipping Address` | Delivery address | No |
| `Billing Address` | Billing address | No |
| `Carrier Name & Tracking Number` | Carrier info | No* |
| `Product Name` | Item name | **Yes** |
| `Gift Message` | Gift message text | No* |
| `Gift Sender Name` | Gift sender | No* |
| `Gift Recipient Contact Details` | Gift recipient | No* |
| `Item Serial Number` | Serial number | No |

*\* = Available but not currently used. Could be added for future features.*

> **Note**: There is **no Category field** in Amazon's retail order export. Product categories would require ASIN lookup via Amazon's Product Advertising API, which would break the privacy-first approach.

---

#### Digital-Ordering (Digital Items)

Digital purchases including Kindle books, apps, music, etc.

| Column | Description | Used |
|--------|-------------|:----:|
| `ASIN` | Amazon product identifier | **Yes** |
| `ProductName` | Item name | **Yes** |
| `OrderId` | Unique order identifier | **Yes** |
| `DigitalOrderItemId` | Digital item ID | No |
| `DeclaredCountryCode` | Country code | No |
| `BaseCurrencyCode` | Currency | No |
| `FulfilledDate` | Fulfillment date | No |
| `IsFulfilled` | Fulfillment status | No |
| `Marketplace` | Amazon marketplace | No |
| `OrderDate` | Date ordered | **Yes** |
| `OriginalQuantity` | Original qty | No |
| `OurPrice` | Price paid | **Yes** |
| `OurPriceCurrencyCode` | Price currency | No |
| `OurPriceTax` | Tax amount | No |
| `OurPriceTaxCurrencyCode` | Tax currency | No |
| `SellerOfRecord` | Seller | No |
| `Publisher` | Publisher/Developer | **Yes** |
| `ThirdPartyDisplayPrice` | Third party price | No |
| `ThirdPartyDisplayCurrencyCode` | Third party currency | No |
| `ListPriceAmount` | List price | No |
| `ListPriceCurrencyCode` | List price currency | No |
| `ListPriceTaxAmount` | List price tax | No |
| `ListPriceTaxCurrencyCode` | List price tax currency | No |
| `GiftItem` | Is gift flag | No* |
| `OrderingCustomerNickname` | Customer name | No |
| `GiftCustomerNickname` | Gift recipient name | No* |
| `GiftMessage` | Gift message | No* |
| `GiftEmail` | Gift recipient email | No |
| `RecipientEmail` | Recipient email | No |
| `GiftRedemption` | Gift redemption status | No |
| `ItemMergedFromAnotherOrder` | Merged order flag | No |
| `QuantityOrdered` | Quantity | **Yes** |
| `ItemFulfilled` | Fulfilled flag | No |
| `ShipFrom` | Ship from location | No |
| `ShipTo` | Ship to location | No |
| `IsOrderEligibleForPrimeBenefit` | Prime eligible | No |
| `OfferingSKU` | SKU | No |
| `FulfillmentMobileNumber` | Mobile number | No |
| `RechargeAmount` | Recharge amount | No |
| `RechargeAmountCurrencyCode` | Recharge currency | No |
| `SubscriptionOrderInfoList` | Subscription info | No |
| `PreviouslyPaidDigitalOrderItemId` | Previous item ID | No |
| `PreviouslyPaidOrderId` | Previous order ID | No |
| `InstallmentOurPrice` | Installment price | No |
| `InstallmentOurPricePlusTax` | Installment + tax | No |
| `DigitalOrderItemAttributes` | Item attributes | No |
| `InstallmentOurPriceCurrencyCode` | Installment currency | No |
| `InstallmentOurPricePlusTaxCurrencyCode` | Installment + tax currency | No |

---

#### Retail.OrdersReturned.Payments (Refunds)

Refund payment records.

| Column | Description | Used |
|--------|-------------|:----:|
| `OrderID` | Order identifier | **Yes** |
| `ReversalID` | Reversal transaction ID | No |
| `RefundCompletionDate` | Date refund completed | **Yes** |
| `Currency` | Currency code | **Yes** |
| `AmountRefunded` | Refund amount | **Yes** |
| `Status` | Refund status | No |
| `DisbursementType` | How refund was issued | No |

---

## Future Enhancement Ideas

Based on available but unused data fields:

| Feature | Data Source |
|---------|-------------|
| "You saved $X this year!" | `Total Discounts` from Retail.OrderHistory |
| Gift tracking | `Gift Message`, `Gift Sender Name` fields |
| Shipping insights | `Shipping Option`, `Carrier Name` fields |
| Payment method breakdown | `Payment Instrument Type` field |
| Delivery time stats | `Ship Date` vs `Order Date` calculation |
| New vs Used tracking | `Product Condition` field |
| Digital gift stats | `GiftItem`, `GiftMessage` from Digital-Ordering |

---

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## License

MIT
