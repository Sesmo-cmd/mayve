export function whatsappLink(number: string, productName: string) {
  const clean = (number || "").replace(/[^0-9]/g, "");
  const text = encodeURIComponent(`Hi, I want to order ${productName}`);
  return `https://wa.me/${clean}?text=${text}`;
}
