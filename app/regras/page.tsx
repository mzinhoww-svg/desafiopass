import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";

// /regras (Task 5.1): regras (REQUISITOS 3/4/9 + SCORING_SPEC) e classificacao.
// Foco em pontos e ranking; vence o bolao quem terminar no topo. Sem emoji.
export default function RegrasPage() {
  return (
    <>
      <Header title="Regras e pontuação" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Regras" }]} />
      <main className="flex flex-1 flex-col gap-5 px-5 py-4">
        <section>
          <p className="t-kicker mb-2 text-indigo">Como participar</p>
          <p className="t-body text-ink">
            Crie sua conta, escolha o placar de cada jogo do mata-mata e salve antes
            do apito inicial. O palpite trava no horário de início da partida (horário
            de Brasília) e vale o último salvo. Sem palpite no prazo, zero ponto
            naquele jogo.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Pontuação base</p>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo text-white">
                  <th className="px-3 py-2 font-bold">Resultado do palpite</th>
                  <th className="px-3 py-2 text-right font-bold">Pontos</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  ["Placar exato", "50"],
                  ["Vencedor certo + gols de um dos lados", "35"],
                  ["Vencedor certo (sem os gols)", "20"],
                  ["Empate certo (placar diferente)", "20"],
                  ["Errado ou sem palpite", "0"],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-cloud" : "bg-paper"}>
                    <td className="px-3 py-2">{k}</td>
                    <td className="px-3 py-2 text-right font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="t-caption mt-2 text-muted">
            A pontuação não é cumulativa: vale só o critério mais alto. Pênaltis não
            contam, o placar considerado é o do tempo normal ou prorrogação.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Multiplicadores</p>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo text-white">
                  <th className="px-3 py-2 font-bold">Fase ou regra</th>
                  <th className="px-3 py-2 text-right font-bold">Multiplicador</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  ["Jogo do Brasil", "x2"],
                  ["Fase de grupos", "x1"],
                  ["16 avos", "x1,2"],
                  ["Oitavas", "x1,4"],
                  ["Quartas", "x1,6"],
                  ["Semifinal e disputa de 3º", "x1,8"],
                  ["Final", "x2"],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-cloud" : "bg-paper"}>
                    <td className="px-3 py-2">{k}</td>
                    <td className="px-3 py-2 text-right font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="t-caption mt-2 text-muted">
            Fórmula: pontos = base × multiplicador do Brasil × multiplicador da fase.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Classificação</p>
          <p className="t-body text-ink">
            Cada palpite vira pontos e os pontos definem o ranking. Vence o bolão
            quem terminar a Copa no topo da classificação geral. Você também
            disputa um ranking dentro de cada liga que participar.
          </p>
          <p className="t-caption mt-2 text-muted">
            O ranking é atualizado a cada jogo encerrado, com desempate por número
            de placares exatos.
          </p>
        </section>
      </main>
    </>
  );
}
