<h2>Changelog</h2>

<details open>
<summary>
  <h3 style="display: inline-block;">[v0.2.2] - 23/03/2026</h3>
</summary>

<h3>Adicionado</h3>

<h4>Local manual e local padrão</h4>

- Componente <code>LocationSelectModal.jsx</code>: seleção encadeada **País &gt; Estado &gt; Município** (dados em <code>src/data/locationOptions.js</code>)
- Persistência do **local padrão** com <code>@react-native-async-storage/async-storage</code>; opção na modal para salvar o município escolhido como padrão (sobrevive a recarregar o app)
- Título clicável na <code>MainScreen</code>: ícone de marcador + texto <code>[cidade], Hoje</code> ou <code>[cidade], DD/MM</code> conforme o dia selecionado; abre a modal de local
- Botão **Usar localização atual** na modal para voltar ao fluxo por GPS (com recarga explícita via <code>reloadToken</code> no <code>useWeather</code>)

<h4>Hook <code>useWeather</code></h4>

- Suporte a <strong>localização manual</strong> (<code>setManualLocation</code>) e leitura/gravação do <strong>local padrão</strong> (<code>defaultLocation</code>, <code>setDefaultLocationPreference</code>)
- Fallback coordenado com o local padrão persistido quando GPS falha ou permissão é negada

<h3>Alterado</h3>

<h4>Previsão horária (<code>HourlyForecast</code> + <code>forecastDateUtils</code>)</h4>

- No lugar da temperatura por hora: **probabilidade de precipitação** (<code>pop</code> da API OWM) em %
- Estados de erro/vazio com melhor espaçamento e texto centralizado

<h4>Tela <code>MainScreen</code></h4>

- Rótulo do cabeçalho do menu acompanha a <strong>data selecionada</strong> (<code>Hoje</code> ou data curta <code>DD/MM</code>)
- Sincronização da altura do céu recolhido (<code>SKY_COLLAPSED_HEIGHT</code>) com <code>useSharedValue</code> quando a tela redimensiona, sem quebrar a animação de expandir/recolher (<code>isExpandedRef</code>)

<h4>Modal de local</h4>

- Ajustes de UX no fechamento (backdrop, propagação de toque) e animações leves por etapa (<code>FadeIn</code>); refinamentos para reduzir flick no web

<h3>Outros</h3>

- Log de desenvolvimento: falha conhecida de geolocalização no web (<code>Failed to query location from network service</code>) tratada como esperada, sem <code>console.warn</code> ruidoso
- Dependência <code>@react-native-async-storage/async-storage</code> no projeto

</details>

<details>
<summary>
  <h3 style="display: inline-block;">[v0.2.1] - 18/03/2026</h3>
</summary>

<h3>Adicionado</h3>

<h4>Seleção de dia + API (previsão por data)</h4>

- **Calendário** no menu expandido (`ForecastCalendar`): grade mensal, navegação **Mês anterior / Próximo mês** e campo **DD/MM/AAAA** para ir a uma data
- Integração oficial com a API: ao escolher um dia, a previsão horária exibida passa a ser a **fatia do mesmo payload `/forecast`** já obtido no carregamento, filtrada por data via `getForecastItemsForDate`
- **Limites de data** alinhados ao intervalo disponível na resposta da API (`minDate` / `maxDate`), evitando seleção fora da previsão retornada
- **Setas** ao lado da data (menu expandido) para avançar/voltar um dia dentro da mesma faixa

<h4>Suporte a configuração e bootstrap</h4>

- `.env.example` e documentação no **README** para `EXPO_PUBLIC_OWM_API_KEY`
- Validação da chave e mensagens de erro mais claras no `useWeather` (chave ausente, HTTP 401/429, etc.)
- Tela de **carregamento unificada** (fontes + clima) antes de exibir o degradê real, evitando “pulo” visual ao concluir a API

<h3>Alterado</h3>

<h4>Hook <code>useWeather</code></h4>

- Passa a expor **`forecastList`** (lista completa do endpoint `/forecast`) além de `hourlyForecast`, permitindo filtrar horários por dia selecionado

<h4>Tela <code>MainScreen</code></h4>

- Estado **data selecionada** sincronizado com `forecastList`; retorno ao “hoje” quando aplicável
- Fluxo partido em **bootstrap** (aguarda clima) e **conteúdo principal** após dados prontos

<h4>Outros</h4>

- Ajustes de UI no calendário (botões de mês, feedback de toque alinhado ao varal)
- Transição de entrada/saída do calendário ao recolher o menu (`FadeInDown` / `FadeOutUp`)
- Botão de expandir/recolher menu atualizado para shape em **SVG personalizado** (`ExpandMenuBtn`)

</details>

<br>

---

<details>
<summary>
  <h3 style="display: inline-block;">[v0.2.0] - 09/03/2026</h3>
</summary>

<h3>Adicionado</h3>

<h4>Hook <code>useWeather</code></h4>

- Solicita permissão de localização via `expo-location`
- Busca clima atual, previsão horária e nome de cidade em paralelo via `Promise.all`
- Reverse geocoding via endpoint `/geo/1.0/reverse` da OWM para resolver corretamente nomes de municípios brasileiros
- Expõe `{ condition, statusText, city, hourlyForecast, isLoading, error }` para os componentes

<h4>Componente <code>HourlyForecast</code></h4>

- Renderiza lista horizontal com hora, ícone e temperatura para cada item do dia
- Três estados distintos: loading (spinner), erro (mensagem) e lista de dados
- Estilos próprios extraídos do `MainScreen`

<h4>Utilitários em <code>weatherUtils</code></h4>

- `getSkyConditionFromIcon` — mapeia código de ícone OWM para `sunny`, `rainy` ou `night`
- `getIconColor` — retorna cor hex correspondente ao ícone OWM

<h3>Alterado</h3>

<h4>Serviço <code>weatherService</code></h4>

- Renomeado `fetchWeather` → `fetchCurrentWeather`
- Adicionado `fetchHourlyForecast` (endpoint `/forecast`, `cnt: 16`)
- Adicionado `fetchCityName` (endpoint `/geo/1.0/reverse`)
- API key movida para variável de ambiente `EXPO_PUBLIC_OWM_API_KEY` via `.env`

<h4>Tela <code>MainScreen</code></h4>

- `useState('sunny')` substituído pelo hook `useWeather`
- Gradiente do céu e texto de status passam a refletir a condição climática real
- Bloco horário inline substituído pelo componente `HourlyForecast`
- Estilos redundantes removidos

<h3>Outros</h3>

- Logs de depuração com `__DEV__` guard em pontos-chave do `useWeather` (não executam em produção)
- `.env` adicionado ao `.gitignore`

</details>

<details>
<summary>
  <h3 style="display: inline-block;">[v0.1.0] - 09/03/2026</h3>
</summary>

<h3>Adicionado</h3>

<h4>Tela principal</h4>

- Gradiente dinâmico de céu via `expo-linear-gradient` (sunny / rainy / night)
- Texto de status climático e placeholder do varal na área do céu
- Dois layers animados: principal (colapsado) e mini (expandido), com opacidade interpolada via `react-native-reanimated`

<h4>Menu inferior</h4>

- Estado recolhido (~20% da tela) e expandido (~90%) com transição suave
- `ScrollView` vertical habilitado apenas no estado expandido
- Seção **"Hoje"** com previsão horária horizontal (dados mockados)
- Seção **"Histórico de Atividade"** com cards de eventos (dados mockados)

<h4>Botão flutuante <code>ToggleVaralBtn</code></h4>

- Posicionado na divisa entre o céu e o menu inferior via `Animated.View` com `top` interpolado
- Texto alterna entre **RECOLHER** e **EXPOR** conforme estado do varal
- Animação de 8 linhas irradiando do centro ao pressionar, com `react-native-reanimated`

<h4>Estrutura base do projeto</h4>

- Roteamento com `expo-router`
- Fontes **Nunito** (Regular, Bold, Black) via `@expo-google-fonts/nunito`
- `theme.js` com paleta de cores e fontes globais
- Placeholders em `weatherService.js` e `arduinoService.js`
- Dados mockados em `mockData.js` (previsão de clima e histórico)

</details>
