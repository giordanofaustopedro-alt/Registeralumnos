'use client'

export default function ImprimirLegajoButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide px-5 py-2.5 bg-cs-green hover:bg-cs-green-light text-white rounded-xl text-sm font-bold transition shadow-md"
    >
      Imprimir / Guardar PDF
    </button>
  )
}
