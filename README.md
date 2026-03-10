<div align="center">

<h2>Guarda-Roupa App</h2>

<p>App mobile que detecta chuva via integração com módulo Arduino e API de clima.</p>

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

<br>

[Sobre](#sobre-o-projeto) &nbsp;•&nbsp;
[Funcionalidades](#funcionalidades) &nbsp;•&nbsp;
[Estrutura](#estrutura-do-projeto) &nbsp;•&nbsp;
[Stack](#tecnologias-utilizadas) &nbsp;•&nbsp;
[Como rodar](#como-rodar) &nbsp;•&nbsp;
[Changelog](#changelog)

</div>

---

<br>

## Sobre o projeto

O **Guarda-Roupa App** é um aplicativo mobile que resolve um problema cotidiano: recolher ou expor roupas no varal sem depender de "achismos" sobre o tempo antes de ser tarde demais.

A ideia central é combinar uma **API de clima em tempo real** com um **módulo Arduino físico** para automatizar (ou pelo menos facilitar) a decisão de expor e recolher roupas.

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Funcionalidades

- Tela principal com gradiente dinâmico de fundo (baseado na condição climática real)
- Seção **"Hoje"** com previsão climática horária horizontal via API OpenWeatherMap
- Menu inferior animado com dois estados: **recolhido** (~20% da tela) e **expandido** (~90%)
- Botão flutuante **RECOLHER / EXPOR** na divisa do menu, com animação de linhas irradiando
- Toggle manual do estado do varal (exposto/recolhido)
- Localização automática via GPS com nome de cidade resolvido por reverse geocoding (OWM)

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Estrutura do projeto

```
guardaRoupaApp/
├── app/                        # Roteamento (Expo Router)
│   ├── _layout.jsx             # Layout raiz (fontes, status bar)
│   └── index.jsx               # Rota inicial → renderiza MainScreen
├── src/
│   ├── components/
│   │   ├── HourlyForecast.jsx  # Previsão horária com estados de loading/erro/dados
│   │   └── ToggleVaralBtn.jsx  # Botão RECOLHER/EXPOR com animação
│   ├── data/
│   │   └── mockData.js         # Dados mockados para desenvolvimento offline
│   ├── hooks/
│   │   └── useWeather.js       # Hook de clima: localização + OWM + reverse geocoding
│   ├── screens/
│   │   └── MainScreen.jsx      # Tela principal do app
│   ├── services/
│   │   ├── arduinoService.js   # Comunicação com o Arduino (placeholder)
│   │   └── weatherService.js   # Chamadas à API OpenWeatherMap
│   └── utils/
│       ├── timeUtils.js        # Formatação de horários
│       └── weatherUtils.js     # Cores do céu, mapeamento de ícones e condições
├── constants/
│   └── theme.js                # Cores, fontes e espaçamentos globais
└── README.md
```

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Tecnologias utilizadas

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Expo Router](https://img.shields.io/badge/Expo_Router-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.github.io/router/)
[![Reanimated](https://img.shields.io/badge/Reanimated-764ABC?style=for-the-badge&logo=react&logoColor=white)](https://docs.swmansion.com/react-native-reanimated/)
[![Linear Gradient](https://img.shields.io/badge/Linear_Gradient-FF6B6B?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
[![Google Fonts](https://img.shields.io/badge/Google_Fonts_(Nunito)-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://fonts.google.com/specimen/Nunito)

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Como rodar

> [!IMPORTANT]
> Certifique-se de ter o **Node.js** e o **Expo CLI** instalados antes de prosseguir.

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/guardaRoupaApp.git
cd guardaRoupaApp
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o projeto
```bash
npx expo start
```

4. Abra no dispositivo escaneando o QR code com o **Expo Go**, ou pressione `w` para abrir no navegador.

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Changelog

### v0.2.0 - 09/03/2026

- Integração real com a API **OpenWeatherMap** (`/weather`, `/forecast`, `/geo/1.0/reverse`)
- Novo hook `useWeather` — solicita permissão de localização, busca clima atual, previsão horária e nome de cidade em paralelo
- Reverse geocoding via endpoint OWM para resolver corretamente nomes de municípios brasileiros
- Novo componente `HourlyForecast` — renderiza previsão horária com estados de loading, erro e lista horizontal
- Novos helpers em `weatherUtils`: `getSkyConditionFromIcon` e `getIconColor`
- Gradiente do céu e texto de status agora refletem a condição climática real
- API key carregada via variável de ambiente `EXPO_PUBLIC_OWM_API_KEY` (`.env`)
- Logs de depuração com `__DEV__` guard (não executam em produção)

### v0.1.0 - 09/03/2026

- Interface principal com gradiente dinâmico de céu
- Menu inferior animado (recolhido/expandido) com `react-native-reanimated`
- Botão flutuante RECOLHER/EXPOR com animação de linhas irradiando
- Previsão horária horizontal com dados mockados
- Estrutura de projeto organizada em `src/` com `screens`, `components`, `services`, `utils` e `data`
- Integração placeholder com Arduino e API de clima, prontos para implementação real

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>
