export function renderTemplate(tpl, data) {
  if (!tpl) return "";
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    const v = data?.[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function moneyBRL(n) {
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
