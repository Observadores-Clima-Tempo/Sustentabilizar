/**
 * Badge — Pílula colorida para status, categorias e contadores.
 *
 * @param {string} variant - 'green' | 'amber' | 'gray' | 'red' | 'yellow' | 'blue'
 * @param {string} className - Classes extras opcionais
 */
const VARIANTS = {
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  gray: 'bg-gray-100 text-gray-500',
  red: 'bg-red-50 text-red-500',
  yellow: 'bg-yellow-50 text-yellow-600',
  blue: 'bg-blue-50 text-blue-600',
}

export function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        VARIANTS[variant] ?? VARIANTS.gray,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
