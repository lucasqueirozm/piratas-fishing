import 'server-only'
import type { Order } from './orders'

// Envio pela API REST da Resend com fetch — mesmo padrão já usado com o MercadoPago
// no cleanup-orders. Evita mais uma dependência num projeto que tem seis.
const ENDPOINT = 'https://api.resend.com/emails'

// Eventos que o cliente recebe. Os status internos (supplier_sent, packed) não geram
// e-mail: não dizem nada para quem comprou.
export type OrderEmailEvent = 'paid' | 'shipped' | 'tracking_sent' | 'failed'

function money(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piratasfishing.com.br').replace(/\/$/, '')
}

// Tabela e estilo inline de propósito: cliente de e-mail não suporta flex/grid de
// forma confiável, e webfont não carrega na maioria deles.
function layout(titulo: string, corpo: string, rodape?: string) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${titulo}</title></head>
<body style="margin:0;padding:24px 12px;background:#f2ede4;font-family:Helvetica,Arial,sans-serif;color:#14110d;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
  <tr><td style="background:#14110d;padding:20px 28px;">
    <span style="color:#ffffff;font-size:17px;font-weight:bold;letter-spacing:.5px;">PIRATAS FISHING</span>
    <span style="color:#8d8271;font-size:12px;display:block;margin-top:2px;">O Segredo da Fisgada</span>
  </td></tr>
  <tr><td style="padding:28px;">${corpo}</td></tr>
  <tr><td style="padding:16px 28px 24px;border-top:1px solid #e6e0d5;color:#8d8271;font-size:11px;line-height:1.6;">
    ${rodape ?? 'Dúvidas? Responda este e-mail.'}<br>
    <a href="${baseUrl()}" style="color:#FF6B00;text-decoration:none;">piratasfishing.com.br</a>
  </td></tr>
</table>
</body></html>`
}

function listaItens(order: Order) {
  const linhas = order.items.map((i) =>
    `<tr>
      <td style="padding:6px 0;font-size:13px;">${i.quantity}× ${i.productName}${i.size ? ` <span style="color:#8d8271;">(${i.size})</span>` : ''}</td>
      <td style="padding:6px 0;font-size:13px;text-align:right;white-space:nowrap;">${money(i.totalPrice)}</td>
    </tr>`).join('')

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
    ${linhas}
    <tr><td colspan="2" style="border-top:1px solid #e6e0d5;padding-top:10px;"></td></tr>
    <tr><td style="font-size:13px;color:#5f574c;">Frete</td><td style="font-size:13px;text-align:right;">${order.shipping === 0 ? 'Grátis' : money(order.shipping)}</td></tr>
    <tr><td style="font-size:15px;font-weight:bold;padding-top:4px;">Total</td><td style="font-size:15px;font-weight:bold;text-align:right;padding-top:4px;color:#FF6B00;">${money(order.total)}</td></tr>
  </table>`
}

function endereco(order: Order) {
  const a = order.customer.address
  return `${a.street}, ${a.number}${a.complement ? ` — ${a.complement}` : ''}<br>${a.neighborhood} · ${a.city}/${a.state}`
}

function botao(href: string, texto: string) {
  return `<a href="${href}" style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:6px;">${texto}</a>`
}

function montar(order: Order, event: OrderEmailEvent): { subject: string; html: string } | null {
  const num = (order.id ?? '').slice(0, 8)
  const nome = order.customer.name.trim().split(/\s+/)[0]

  switch (event) {
    case 'paid':
      return {
        subject: `Pagamento confirmado — pedido #${num}`,
        html: layout('Pagamento confirmado', `
          <h1 style="margin:0 0 8px;font-size:20px;">Pagamento confirmado, ${nome}!</h1>
          <p style="margin:0 0 4px;font-size:14px;color:#5f574c;line-height:1.6;">Recebemos seu pagamento e já começamos a preparar o pedido <strong>#${num}</strong>. Avisamos assim que ele for postado.</p>
          ${listaItens(order)}
          <p style="margin:16px 0 4px;font-size:12px;color:#8d8271;text-transform:uppercase;letter-spacing:1px;">Entrega</p>
          <p style="margin:0;font-size:13px;line-height:1.6;">${endereco(order)}</p>`),
      }

    case 'shipped':
      return {
        subject: `Seu pedido foi despachado — #${num}`,
        html: layout('Pedido despachado', `
          <h1 style="margin:0 0 8px;font-size:20px;">Seu pedido saiu, ${nome}</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#5f574c;line-height:1.6;">O pedido <strong>#${num}</strong> foi despachado e está a caminho. Assim que o código de rastreio for gerado, enviamos para você.</p>
          <p style="margin:0 0 4px;font-size:12px;color:#8d8271;text-transform:uppercase;letter-spacing:1px;">Entrega</p>
          <p style="margin:0;font-size:13px;line-height:1.6;">${endereco(order)}</p>`),
      }

    case 'tracking_sent': {
      // Sem código não há o que comunicar — o kanban exige o campo, mas se vier
      // vazio é melhor não enviar do que mandar um e-mail sem conteúdo.
      const codigo = order.trackingCode?.trim()
      if (!codigo) return null
      return {
        subject: `Código de rastreio do pedido #${num}`,
        html: layout('Código de rastreio', `
          <h1 style="margin:0 0 8px;font-size:20px;">Já dá para acompanhar, ${nome}</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#5f574c;line-height:1.6;">Seu pedido <strong>#${num}</strong> foi postado. Use o código abaixo para acompanhar nos Correios:</p>
          <p style="margin:0 0 20px;font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:2px;background:#f6f2ea;border:1px solid #e6e0d5;border-radius:6px;padding:14px;text-align:center;">${codigo}</p>
          ${botao(`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(codigo)}`, 'Rastrear pedido')}
          <p style="margin:16px 0 0;font-size:12px;color:#8d8271;line-height:1.6;">O código pode levar algumas horas para aparecer no site dos Correios.</p>`),
      }
    }

    case 'failed':
      return {
        subject: `Seu pedido #${num} expirou`,
        html: layout('Pedido expirado', `
          <h1 style="margin:0 0 8px;font-size:20px;">Não conseguimos confirmar o pagamento</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#5f574c;line-height:1.6;">Oi, ${nome}. O pedido <strong>#${num}</strong> ficou 48h sem confirmação de pagamento, então liberamos os itens. Se ainda quiser as iscas, é só refazer — leva um minuto.</p>
          ${botao(`${baseUrl()}/catalogo`, 'Voltar ao catálogo')}
          <p style="margin:16px 0 0;font-size:12px;color:#8d8271;line-height:1.6;">Se você já pagou, responda este e-mail que a gente verifica.</p>`,
          'Recebeu por engano? Pode ignorar este e-mail.'),
      }
  }
}

// Nunca lança: o e-mail é efeito colateral do pedido e não pode derrubar o webhook,
// o cron ou a mudança de status no kanban. Devolve se enviou ou não.
export async function sendOrderEmail(order: Order, event: OrderEmailEvent): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY ausente — "${event}" do pedido ${order.id} não enviado`)
    return false
  }

  const destino = order.customer?.email?.trim()
  if (!destino) {
    console.warn(`[email] pedido ${order.id} sem e-mail do cliente`)
    return false
  }

  const conteudo = montar(order, event)
  if (!conteudo) return false

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // O MercadoPago retenta o webhook; a chave evita e-mail duplicado (24h na Resend).
        'Idempotency-Key': `${order.id}:${event}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? 'Piratas Fishing <pedidos@send.piratasfishing.com.br>',
        to: destino,
        reply_to: process.env.NEXT_PUBLIC_EMAIL || undefined,
        subject: conteudo.subject,
        html: conteudo.html,
      }),
    })

    if (!res.ok) {
      console.error(`[email] falha ao enviar "${event}" do pedido ${order.id}: ${res.status} ${await res.text()}`)
      return false
    }
    console.log(`[email] "${event}" enviado para o pedido ${order.id}`)
    return true
  } catch (err) {
    console.error(`[email] erro de rede ao enviar "${event}" do pedido ${order.id}:`, err)
    return false
  }
}
