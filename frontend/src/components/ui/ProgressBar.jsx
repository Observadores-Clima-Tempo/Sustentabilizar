/**
 * ProgressBar — Barra de progresso acessível.
 *
 * @param {number} value      - Valor atual
 * @param {number} max        - Valor máximo (padrão: 100)
 * @param {string} color      - 'green' | 'amber' | 'red' | 'gray'
 * @param {string} label      - Texto à esquerda (opcional)
 * @param {boolean} showValue - Exibe "valor/max" à direita (opcional)
 * @param {string} className  - Classes extras opcionais
 */
const COLORS = {
  green: 'bg-green-600',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
}

export function ProgressBar({
  value = 0,
  max = 100,
  color = 'green',
  label,
  showValue = false,
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const barColor = COLORS[color] ?? COLORS.green

  return (
    <div className={`space-y-1 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-gray-500">
          {label && <span>{label}</span>}
          {showValue && (
            <span>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
