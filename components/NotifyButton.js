"use client";

// "Notify me" on a product card: brings the page's email form into view and puts the cursor in it.
export default function NotifyButton({ label }) {
  function onClick(e) {
    const page = e.currentTarget.closest("main");
    const field = page && page.querySelector('.js-notify input[type="email"]');
    if (!field) return;
    field.closest(".notify").scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => field.focus(), 400);
  }
  return (
    <button className="btn btn--dark btn--sm" type="button" data-notify="" onClick={onClick}>
      {label}
    </button>
  );
}
