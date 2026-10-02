// The Synthetic Data page.

const syntheticData = {
  meta: {
    title: "Synthetic Data, Titan Wave Media",
    description: "Realistic data. No real people. Computer generated datasets for training AI and testing software.",
  },

  hero: {
    title: "Realistic data. No real people.",
    text: "We make computer generated datasets that look and behave like real data, so you can train AI and test software without exposing anyone's details.",
    buttons: [{ label: "Talk to us about data", href: "/contact?need=data", style: "dark" }],
  },

  who: {
    title: "Who it is for",
    cards: [
      { icon: "layers", title: "AI teams", text: "Train models when real data is scarce or private." },
      { icon: "code", title: "Developers", text: "Test apps with data that looks real." },
      { icon: "bank", title: "Banks and fintechs", text: "Test fraud checks without touching customer records." },
    ],
  },

  // The "On this page" bar. Each id is the section it jumps to.
  subnav: [
    { id: "data-who", label: "Who it is for" },
    { id: "data-build", label: "Build a sample" },
    { id: "data-how", label: "How it works" },
  ],

  build: {
    title: "Build a sample dataset",
    text: "Choose the fields and how many rows. Every value is generated. None of it belongs to a real person.",
    fieldsLegend: "Fields",
    // The labels are also the column headings of the table and the CSV.
    fields: [
      { value: "name", label: "Name", checked: true },
      { value: "state", label: "State", checked: true },
      { value: "type", label: "Account type", checked: true },
      { value: "amount", label: "Amount (₦)", checked: true },
      { value: "date", label: "Date", checked: true },
      { value: "phone", label: "Phone number" },
      { value: "email", label: "Email" },
    ],
    rowsLegend: "Rows",
    rows: [
      { value: "5", checked: true },
      { value: "10" },
      { value: "25" },
    ],
    make: "Make dataset",
    copy: "Copy as CSV",
    caption: "Sample only. Every row is made up.",
    noFields: "Tick at least one field.",
    made: "{rows} rows, {fields} fields. All made up.",
    copied: "Copied {rows} rows as CSV. Paste it into a spreadsheet.",
    selectToCopy: "Select the text below and copy it.",
    csvLabel: "CSV to copy",
  },

  how: {
    title: "How it works",
    steps: [
      { title: "Tell us the data you need", text: "The fields, the size and what it will be used for." },
      { title: "Check a sample", text: "You review a small set before we make the rest." },
      { title: "Get the full dataset", text: "Delivered in the format your team works with." },
    ],
  },

  cta: {
    title: "Tell us what data you need.",
    buttons: [{ label: "Talk to us", href: "/contact?need=data", style: "dark" }],
  },
};

export default syntheticData;
