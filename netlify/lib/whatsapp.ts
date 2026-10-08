// Envio de alerta pela WhatsApp Cloud API (Meta). Usa template aprovado, pois a
// mensagem é iniciada pelo negócio, fora da janela de 24 h de conversa.
// Variáveis de ambiente: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ALERT_TEMPLATE.

export type AlertResult = { status: 'enviado'; providerMessageId: string } | { status: 'falhou'; detail: string }

export async function sendLowStockAlert(
  to: string,
  propertyName: string,
  items: { name: string; pct: number }[],
): Promise<AlertResult> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const template = process.env.WHATSAPP_ALERT_TEMPLATE
  if (!token || !phoneNumberId || !template) {
    return { status: 'falhou', detail: 'WhatsApp não configurado' }
  }

  // Template sugerido: "No imóvel {{1}}, estes itens estão acabando: {{2}}. Reponha pelo painel."
  const itemList = items.map((i) => `${i.name} (${i.pct}%)`).join(', ')

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: template,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: propertyName },
              { type: 'text', text: itemList },
            ],
          },
        ],
      },
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) return { status: 'falhou', detail: `WhatsApp respondeu HTTP ${response.status}` }
  return { status: 'enviado', providerMessageId: data.messages?.[0]?.id ?? '' }
}
