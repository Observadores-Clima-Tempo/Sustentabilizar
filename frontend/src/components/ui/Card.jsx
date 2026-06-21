/**
 * Card — Contêiner branco com borda e sombra sutil.
 *
 * @param {boolean} clickable - Adiciona efeito de hover ao clicar
 * @param {string} className  - Classes extras opcionais
 */
export function Card({ children, className = '', clickable = false }) {
  const base = 'bg-white rounded-xl border border-gray-200 shadow-sm'
  const hover = clickable
    ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-150'
    : ''

  return <div className={`${base} ${hover} ${className}`}>{children}</div>
}
