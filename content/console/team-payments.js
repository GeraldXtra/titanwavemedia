// Team view, Payments: money in, what is owed, and what reached the bank.

const teamPayments = {
  meta: { title: "Payments, Titan Wave Media Console" },
  title: "Payments",
  lede: "Money coming in from clients, what's still owed, and what's reached your bank.",
  test: "Test mode. No real money moves.",
  newInvoice: "New invoice",

  kpis: {
    month: "Received this month",
    monthSub: "{month}, after refunds",
    owed: "Waiting to be paid",
    owedSub: "{count} invoices not paid yet",
    owedOne: "1 invoice not paid yet",
    owedNone: "Nobody owes you anything",
    out: "Paid out to your bank",
    outSub: "From Paystack's settlements",
    way: "On the way to your bank",
    waySub: "Settlements Paystack hasn't paid yet",
    unknown: "Paystack didn't answer",
  },

  received: {
    title: "Payments received",
    note: "Fees are Paystack's own figures for each payment.",
    date: "Date",
    client: "Client",
    for: "For",
    with: "Paid with",
    amount: "Amount",
    fee: "Fee",
    you: "You get",
    none: "None",
    empty: "No payments yet.",
    receipt: "Receipt",
  },

  payouts: {
    title: "Payouts to your bank",
    note: "Paystack pays out to the bank account in your Paystack dashboard, usually the next working day.",
    date: "Date",
    amount: "Amount",
    status: "Status",
    states: { success: "Paid out", processing: "On the way", pending: "On the way", failed: "Didn't go through" },
    empty: "No payouts yet. They show here once Paystack settles your first payments.",
    failed: "Paystack didn't answer. Try again in a moment.",
  },

  waiting: {
    title: "Waiting to be paid",
    due: "{number}, due {date}",
    reminded: "Reminder sent {date}",
    view: "View",
    empty: "Nobody owes you anything right now.",
  },

  attention: {
    title: "Needs a look",
    review: "{number}: Paystack took {received} but the invoice is {amount}. Check it in Paystack, and refund or ask for the rest.",
    double: "{number} was paid twice. Refund one of the payments from its receipt.",
  },
};

export default teamPayments;
