<h2>Changelog</h2>

<details open>
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

<br>

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
