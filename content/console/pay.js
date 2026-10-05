// Pay with Titan Wave: our window. It shows what you are paying for and the amount, and you
// pick how to pay. Card details are only ever typed into Paystack's own secure window.

const pay = {
  title: "Pay with Titan Wave",
  test: "Test mode. No real money moves.",
  to: "To Titan Wave Media LTD",
  close: "Close",
  tabsLabel: "How to pay",
  tabs: { card: "Card", bank_transfer: "Bank transfer", ussd: "USSD" },

  card: {
    saved: "Pay with a saved card",
    newCard: "Use a new card",
    text: "Paystack's secure window opens for your card details. We never see them.",
    button: "Pay {amount}",
  },
  bank_transfer: {
    text: "Paystack's secure window gives you an account number for this payment. Transfer the exact amount from any bank app, then come back here.",
    button: "Pay {amount} by bank transfer",
  },
  ussd: {
    text: "Paystack's secure window gives you a code to dial from the phone linked to your bank account. No internet needed.",
    button: "Pay {amount} with USSD",
  },

  waitingTitle: "Finish in Paystack's window",
  waitingText: "Keep this page open.",
  checkingTitle: "Checking your payment",
  checkingText: "This takes a few seconds.",

  okTitle: "Payment received",
  okText: "{amount} paid with {method}. Your receipt {number} is ready, and we sent it to your email.",
  receipt: "View your receipt",
  done: "Done",
  save: {
    title: "Save this card for monthly payments?",
    text: "Next time you can pay with it in one step, and Care can be paid automatically if you switch that on. We keep only what Paystack gives us, never the card number.",
    yes: "Save this card",
    no: "No thanks",
    saved: "{card} is saved.",
  },

  failTitle: "Your payment didn't go through",
  failText: "Nothing was taken from your account. Try another card, or pay by bank transfer.",
  tryCard: "Try again",
  tryBank: "Pay by bank transfer",

  pendingTitle: "We're waiting for your payment",
  pendingText: "If you sent a transfer, it can take a few minutes to arrive. We email your receipt when it does, and this invoice shows Paid.",

  cancelled: "The payment window was closed. Nothing was taken.",
  failed: "That didn't go through. Please try again in a moment.",
  notDue: "This invoice is already paid.",
  ownerOnly: "Only an owner of {business} can pay invoices.",
  checking: "A payment for this invoice is being checked. Message us on WhatsApp if you need help.",

  foot: "Payments go through Paystack, a licensed payment company. Titan Wave Media never sees your card details.",
};

export default pay;
