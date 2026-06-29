import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { getLocale, tr } from "@/lib/i18n";

// /regras (Task 5.1): regras (REQUISITOS 3/4/9 + SCORING_SPEC) e classificacao.
// Foco em pontos e ranking; vence o bolao quem terminar no topo. Sem emoji.
export default async function RegrasPage() {
  const locale = await getLocale();
  return (
    <>
      <Header title={tr(locale, "Regras e pontuação", "Reglas y puntuación")} subtitle={tr(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminatorias")} />
      <Breadcrumbs items={[{ label: tr(locale, "Início", "Inicio"), href: "/" }, { label: tr(locale, "Regras", "Reglas") }]} />
      <main className="flex flex-1 flex-col gap-5 px-5 py-4">
        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Como participar", "Cómo participar")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Crie sua conta, escolha o placar de cada jogo do mata-mata e salve antes do apito inicial. O palpite trava no horário de início da partida (horário de Brasília) e vale o último salvo. Sem palpite no prazo, zero ponto naquele jogo.",
              "Crea tu cuenta, elige el marcador de cada partido de las eliminatorias y guárdalo antes del pitazo inicial. El pronóstico se bloquea a la hora de inicio del partido (horario de Brasilia) y vale el último guardado. Sin pronóstico dentro del plazo, cero puntos en ese partido.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Pontuação base", "Puntuación base")}</p>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo text-white">
                  <th className="px-3 py-2 font-bold">{tr(locale, "Resultado do palpite", "Resultado del pronóstico")}</th>
                  <th className="px-3 py-2 text-right font-bold">{tr(locale, "Pontos", "Puntos")}</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  [tr(locale, "Placar exato", "Marcador exacto"), "50"],
                  [tr(locale, "Vencedor certo + gols de um dos lados", "Ganador correcto + goles de un lado"), "35"],
                  [tr(locale, "Vencedor certo (sem os gols)", "Ganador correcto (sin los goles)"), "20"],
                  [tr(locale, "Empate certo (placar diferente)", "Empate correcto (marcador distinto)"), "20"],
                  [tr(locale, "Errado ou sem palpite", "Incorrecto o sin pronóstico"), "0"],
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
            {tr(
              locale,
              "A pontuação não é cumulativa: vale só o critério mais alto. Pênaltis não contam, o placar considerado é o do tempo normal ou prorrogação.",
              "La puntuación no es acumulativa: vale solo el criterio más alto. Los penales no cuentan; el marcador considerado es el del tiempo reglamentario o la prórroga.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Multiplicadores", "Multiplicadores")}</p>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-indigo text-white">
                  <th className="px-3 py-2 font-bold">{tr(locale, "Fase ou regra", "Fase o regla")}</th>
                  <th className="px-3 py-2 text-right font-bold">{tr(locale, "Multiplicador", "Multiplicador")}</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  [tr(locale, "Jogo do Brasil", "Partido de Brasil"), "x2"],
                  [tr(locale, "Fase de grupos", "Fase de grupos"), "x1"],
                  [tr(locale, "16 avos", "Dieciseisavos"), "x1,2"],
                  [tr(locale, "Oitavas", "Octavos"), "x1,4"],
                  [tr(locale, "Quartas", "Cuartos"), "x1,6"],
                  [tr(locale, "Semifinal e disputa de 3º", "Semifinal y partido por el 3.º"), "x1,8"],
                  [tr(locale, "Final", "Final"), "x2"],
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
            {tr(
              locale,
              "Fórmula: pontos = base × multiplicador do Brasil × multiplicador da fase.",
              "Fórmula: puntos = base × multiplicador de Brasil × multiplicador de la fase.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Classificação", "Clasificación")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Cada palpite vira pontos e os pontos definem o ranking. Vence o bolão quem terminar a Copa no topo da classificação geral. Você também disputa um ranking dentro de cada liga que participar.",
              "Cada pronóstico se convierte en puntos y los puntos definen el ranking. Gana la polla quien termine la Copa en lo más alto de la clasificación general. También compites en un ranking dentro de cada liga en la que participes.",
            )}
          </p>
          <p className="t-caption mt-2 text-muted">
            {tr(
              locale,
              "O ranking é atualizado a cada jogo encerrado, com desempate por número de placares exatos.",
              "El ranking se actualiza con cada partido terminado, con desempate por cantidad de marcadores exactos.",
            )}
          </p>
        </section>
      </main>
    </>
  );
}
