import { Link } from 'react-router-dom'

/** Boton polimorfico: <button>, <Link> (prop `to`) o <a> (prop `href`). */
export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>
  if (href) return <a href={href} className={classes} {...rest}>{children}</a>
  const Tag = as || 'button'
  return <Tag className={classes} {...rest}>{children}</Tag>
}
