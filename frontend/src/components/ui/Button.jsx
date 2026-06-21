/**
 * Button — Componente de botão reutilizável.
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost'
 * @param {string} size    - 'sm' | 'md' | 'lg'
 * @param {boolean} disabled
 * @param {string} className - classes extras opcionais
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg ' +
    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary:
      'bg-green-700 hover:bg-green-800 text-white focus:ring-green-500 ' +
      'disabled:bg-green-200 disabled:cursor-not-allowed',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-400',
    ghost:
      'text-green-700 hover:text-green-800 underline-offset-2 hover:underline focus:ring-green-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
