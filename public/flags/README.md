# public/flags

Bandeiras em SVG real de todas as 32 selecoes do mata-mata. Fonte: biblioteca
flag-icons (lipis/flag-icons), licenca MIT. Assets locais para funcionar offline e sem
depender de CDN em runtime.

Nomenclatura: codigo ISO 3166-1 alpha-2 minusculo (ex br.svg, jp.svg). Excecao:
Inglaterra usa a subdivisao gb-eng.svg.

O campo flagCode em lib/data/copa2026.ts aponta para o arquivo (ex flagCode 'br' ->
/flags/br.svg). O componente components/flag.tsx renderiza o SVG. Nunca emoji.

Mapa selecao -> arquivo:
BRA br | JPN jp | GER de | PAR py | FRA fr | SWE se | RSA za | CAN ca | NED nl |
MAR ma | POR pt | CRO hr | ESP es | AUT at | USA us | BIH ba | BEL be | SEN sn |
CIV ci | NOR no | MEX mx | ECU ec | ENG gb-eng | COD cd | ARG ar | CPV cv | AUS au |
EGY eg | SUI ch | ALG dz | COL co | GHA gh

Para atualizar a versao da flag-icons, rebaixe os SVGs do CDN jsDelivr mantendo os
mesmos nomes de arquivo.
