// An email address that may move onto a second line after the @ on narrow screens,
// rather than breaking in the middle of a word.
export default function Email({ address }) {
  const at = address.indexOf("@");
  if (at < 0) return address;
  return (
    <>
      {address.slice(0, at + 1)}
      <wbr />
      {address.slice(at + 1)}
    </>
  );
}
