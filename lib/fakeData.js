// Made up Nigerian records for the dataset demos. Every value is generated; none belongs to a person.

const FIRST = ["Oluchi", "Tunde", "Ngozi", "Chidi", "Halima", "Femi", "Amaka", "Yusuf", "Funmi", "Ikechukwu", "Zainab", "Segun", "Ifeoma", "Musa", "Temitope", "Emeka", "Aisha", "Kunle", "Chioma", "Babajide"];
const LAST = ["Okafor", "Bakare", "Eze", "Bello", "Adeyemi", "Nwosu", "Lawal", "Okonkwo", "Ibrahim", "Ogunleye", "Uche", "Abubakar", "Afolabi", "Nnamdi", "Danjuma", "Oyelaran"];
const STATES = ["Lagos", "Abuja (FCT)", "Rivers", "Kano", "Oyo", "Enugu", "Kaduna", "Anambra", "Ogun", "Delta", "Edo", "Kwara", "Plateau", "Akwa Ibom"];
const TYPES = ["Savings", "Current", "Domiciliary", "Fixed deposit"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const CITIES = ["Ikeja", "Lekki", "Yaba", "Surulere", "Wuse", "Garki", "Port Harcourt", "Ibadan", "Enugu", "Kano"];
const ITEMS = ["Jollof rice", "Shawarma", "Pepper soup", "Chicken wings", "Fried rice", "Suya", "Moi moi", "Puff puff"];
const ORDER_STATUS = ["Delivered", "Paid", "Shipped", "Refunded", "Pending"];
const CUSTOMER_STATUS = ["Active", "Active", "New", "Inactive"];
const NETWORKS = ["803", "805", "806", "810", "813", "816", "903", "906"];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const money = (n) => n.toLocaleString("en-NG");
// Amounts spread evenly on a log scale, rounded to the nearest 50.
const amount = (lo, hi) => Math.round(Math.exp(Math.log(lo) + Math.random() * (Math.log(hi) - Math.log(lo))) / 50) * 50;
const date = () => 1 + Math.floor(Math.random() * 28) + " " + pick(MONTHS) + " 2026";

// One row for the home page dataset maker: bank, customers or orders.
export function demoRow(kind) {
  if (kind === "customers") {
    return [pick(FIRST) + " " + pick(LAST), pick(CITIES), date(), String(1 + Math.floor(Math.random() * 40)), pick(CUSTOMER_STATUS)];
  }
  if (kind === "orders") {
    return ["#" + (4000 + Math.floor(Math.random() * 999)), pick(ITEMS), pick(FIRST) + " " + pick(LAST).charAt(0) + ".", money(amount(1500, 45000)), pick(ORDER_STATUS)];
  }
  return [pick(FIRST) + " " + pick(LAST), pick(STATES), pick(TYPES), money(amount(2500, 2500000)), date()];
}

// One row for the Synthetic Data page builder, with the fields that are ticked.
export function datasetRow(fields) {
  const first = pick(FIRST);
  const last = pick(LAST);
  return fields.map((field) => {
    if (field === "name") return first + " " + last;
    if (field === "state") return pick(STATES);
    if (field === "type") return pick(TYPES);
    if (field === "amount") return money(amount(2500, 2500000));
    if (field === "date") return date();
    if (field === "phone") return "0" + pick(NETWORKS) + " 555 " + String(1000 + Math.floor(Math.random() * 9000));
    if (field === "email") return (first + "." + last).toLowerCase() + "@example.com";
    return "";
  });
}
