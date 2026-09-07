'use client'

export default function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-cs-green text-white rounded-xl font-bold">
      Imprimir
    </button>
  )
}
