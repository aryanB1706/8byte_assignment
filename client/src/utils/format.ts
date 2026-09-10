// centralized formatters with N/A guard - prevents toLocaleString crash on Yahoo rate-limit fallback
export function fmtMoney(n: number | string): string {
  if (n === "N/A" || n === null || n === undefined) return "N/A"
  if (typeof n === "string") return n
  return `₹${n.toLocaleString('en-IN')}`
}
export function fmt(n: number | string): string {
  if (n === "N/A" || n === null || n === undefined) return "N/A"
  if (typeof n === "string") return n
  return n.toLocaleString('en-IN')
}
