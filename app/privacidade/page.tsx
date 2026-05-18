import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Piratas Fishing',
  description: 'Saiba como a Piratas Fishing coleta, usa e protege seus dados pessoais conforme a LGPD.',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-[#FF6B00] text-sm transition-colors">← Voltar ao início</Link>

        <h1 className="text-4xl font-black uppercase tracking-wider mt-4 mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">1. Quem somos</h2>
            <p>
              A <strong className="text-white">Piratas Fishing</strong> é uma empresa de comércio eletrônico
              especializada em iscas de pesca. Esta Política de Privacidade descreve como coletamos,
              usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de
              Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">2. Dados que coletamos</h2>
            <p className="mb-3">Ao utilizar nosso site e realizar compras, podemos coletar:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white">Dados de identificação:</strong> nome completo, CPF</li>
              <li><strong className="text-white">Dados de contato:</strong> e-mail, telefone</li>
              <li><strong className="text-white">Dados de endereço:</strong> CEP, rua, número, complemento, bairro, cidade e estado (para entrega)</li>
              <li><strong className="text-white">Dados de navegação:</strong> endereço IP, tipo de dispositivo, páginas acessadas, duração da visita (via Google Analytics)</li>
              <li><strong className="text-white">Dados de transação:</strong> itens comprados, valor total, status do pagamento (processados pelo Mercado Pago)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">3. Finalidade e base legal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-2 pr-4 text-white">Finalidade</th>
                    <th className="py-2 text-white">Base legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="py-2 pr-4">Processar pedidos e pagamentos</td>
                    <td className="py-2">Execução de contrato (Art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Entregar produtos ao endereço informado</td>
                    <td className="py-2">Execução de contrato (Art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Enviar confirmação e atualizações do pedido</td>
                    <td className="py-2">Execução de contrato (Art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Análise de desempenho e melhoria do site</td>
                    <td className="py-2">Legítimo interesse (Art. 7º, IX)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Cookies de análise (Google Analytics)</td>
                    <td className="py-2">Consentimento (Art. 7º, I)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">4. Compartilhamento de dados</h2>
            <p className="mb-3">Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white">Mercado Pago</strong> — processamento de pagamentos. Consulte a{' '}
                <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline">política de privacidade do Mercado Pago</a>.
              </li>
              <li><strong className="text-white">Google (Analytics e Firebase)</strong> — análise de tráfego e armazenamento de dados. Consulte a{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline">política de privacidade do Google</a>.
              </li>
              <li><strong className="text-white">Transportadoras / Correios</strong> — nome e endereço para entrega.</li>
              <li><strong className="text-white">E-mail (contato)</strong> — somente se você nos contatar diretamente por e-mail.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white">Transferência internacional de dados (LGPD Art. 33):</strong>{' '}
              Os serviços Google Analytics e Firebase armazenam dados em servidores localizados nos Estados Unidos.
              Essa transferência é realizada com base nas Cláusulas Contratuais Padrão da Google LLC,
              que garantem nível de proteção adequado nos termos da LGPD.
            </p>
            <p className="mt-3">Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">5. Cookies</h2>
            <p className="mb-3">Utilizamos cookies para:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white">Cookies essenciais:</strong> funcionamento básico do site (sessão, carrinho).</li>
              <li><strong className="text-white">Cookies analíticos:</strong> Google Analytics para entender como o site é usado. Ativados apenas com seu consentimento.</li>
            </ul>
            <p className="mt-3">Você pode aceitar ou recusar cookies analíticos pelo banner exibido na primeira visita. Navegadores também permitem desativar cookies nas configurações.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">6. Seus direitos (LGPD)</h2>
            <p className="mb-3">Como titular de dados, você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato através da{' '}
              <Link href="/contato" className="text-[#FF6B00] hover:underline">página de contato</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">7. Retenção de dados</h2>
            <p>
              Dados de pedidos são mantidos por até <strong className="text-white">5 anos</strong> para
              fins contábeis e fiscais, conforme legislação brasileira. Dados analíticos são mantidos
              conforme configuração do Google Analytics (padrão: 14 meses). Você pode solicitar a
              exclusão antecipada a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra
              acesso não autorizado, perda ou destruição, incluindo comunicação via HTTPS e
              armazenamento em banco de dados com controle de acesso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">9. Encarregado (DPO)</h2>
            <p>
              O responsável pelo tratamento de dados pessoais (Encarregado / DPO) da Piratas Fishing
              pode ser contatado pelos seguintes canais:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>
                <strong className="text-white">E-mail:</strong>{' '}
                <a href="mailto:privacidade@piratasfishing.com.br" className="text-[#FF6B00] hover:underline">
                  privacidade@piratasfishing.com.br
                </a>
              </li>
              <li>
                <strong className="text-white">Formulário:</strong>{' '}
                <Link href="/contato" className="text-[#FF6B00] hover:underline">página de contato</Link>
              </li>
            </ul>
            <p className="mt-3 text-sm">
              Prazo de resposta: até 15 dias corridos, conforme LGPD Art. 18 § 3º.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#FF6B00] mb-3">10. Alterações desta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. A versão mais recente estará sempre
              disponível nesta página com a data de última atualização.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
