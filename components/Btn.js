import Link from "next/link";
import Icon from "./Icon";
import { cx, isExternal } from "@/lib/text";

// A button that is a link. `style` is solid (red, only for the one main button in an area) or
// line (every other button); `size` can be sm.
// `plain` leaves out the inner <span>, as some buttons in the design do.
export default function Btn({ href, label, style, size, icon, plain, className, ...rest }) {
  const cls = cx("btn", style && `btn--${style}`, size && `btn--${size}`, className);
  const inner = (
    <>
      {icon && <Icon name={icon} className={null} />}
      {plain ? label : <span>{label}</span>}
    </>
  );
  if (isExternal(href)) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener" {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link className={cls} href={href} {...rest}>
      {inner}
    </Link>
  );
}
