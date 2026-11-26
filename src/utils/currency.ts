export function formatCurrency(value: number) {
  const [inteiro, centavos] = Math.abs(value).toFixed(2).split('.');
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}R$ ${milhar},${centavos}`;
}
