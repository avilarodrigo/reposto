// Demo number — replace with the real business WhatsApp before launch.
export const WHATSAPP_NUMBER = '5500900000000'
export const WHATSAPP_DISPLAY = '+55 (00) 90000-0000'

export const whatsappLink = (
  message = 'Olá! Quero saber mais sobre o abastecimento recorrente para meus imóveis de temporada.',
) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
