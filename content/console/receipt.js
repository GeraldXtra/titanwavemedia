// One receipt, as the client sees it (and as it prints or saves as a PDF).

const receipt = {
  title: "Receipt {number}",
  crumb: "Payments and receipts",
  crumbTeam: "Payments",
  doc: {
    kind: "Receipt",
    from: "Received from",
    paidOn: "Paid on",
    paidWith: "Paid with",
    reference: "Reference",
    forInvoice: "For invoice",
    amount: "Amount paid",
    refunded: "Refunded",
    stampPaid: "PAID",
    stampRefunded: "REFUNDED",
    foot: "This receipt confirms that Titan Wave Media LTD received this payment. Keep it for your records.",
    refundAsked: "You asked for a refund on {date}. We decide on every refund request within 5 working days.",
    refundDone: "Refunded on {date}: {amount}, back to the way you paid.",
  },
  print: "Print or save as PDF",
  email: "Email me a copy",
  emailed: "Sent to {email}.",
  refund: {
    button: "Ask for a refund",
    title: "Ask for a refund",
    what: "Receipt {number}, {amount} for {title}.",
    why: "Why",
    reasons: ["It doesn't work as described", "I was charged twice", "I changed my mind", "Something else"],
    more: "Tell us more",
    morePlaceholder: "What happened",
    note: "We decide on every refund request within 5 working days, as our Refund Policy says.",
    send: "Send the request",
    cancel: "Cancel",
    sent: "Refund request sent. We decide within 5 working days.",
    ownerOnly: "Only an owner of {business} can ask for a refund.",
    already: "There's already a refund request for this receipt.",
  },
};

export default receipt;
