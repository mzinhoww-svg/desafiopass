import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";

// /regras (Task 5.1): regras (REQUISITOS 3/4/9 + SCORING_SPEC) e premios em milhas
// LATAM Pass. Valores por faixa "a definir" ate o time fechar. Sem reais. Sem emoji.
export default function RegrasPage() {
  return (
    <>
      <Header title="Regras e prêmios" subtitle="Copa 2026 · Mata-mata" />
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
                  ["32-avos", "x1,2"],
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
          <p className="t-kicker mb-2 text-indigo">Prêmios em milhas LATAM Pass</p>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo text-white">
                  <th className="px-3 py-2 font-bold">Posição</th>
                  <th className="px-3 py-2 text-right font-bold">Prêmio</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  ["1º lugar", "a definir"],
                  ["2º e 3º", "a definir"],
                  ["4º ao 10º", "a definir"],
                  ["11º ao 100º", "a definir"],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-cloud" : "bg-paper"}>
                    <td className="px-3 py-2">{k}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="t-caption mt-2 text-muted">
            Premiação sempre em milhas LATAM Pass. O crédito das milhas é um processo
            fora do app, operado pela LATAM Pass.
          </p>
        </section>
      </main>
    </>
  );
}
