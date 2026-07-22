/**
 * Format a number as Indonesian Rupiah currency.
 * Example: formatRupiah(12500) => "Rp12.500"
 * Example: formatRupiah(12500.50) => "Rp12.500"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
