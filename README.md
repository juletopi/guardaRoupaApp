<div align="center">
   <a href="">
    <img src="https://github.com/juletopi/guardaRoupaApp/blob/main/assets/images/guarda-roupa-logo.png" alt="Guarda-roupa-logo" width="230px" title="Guarda-roupa App">
  </a>
   <h2 align="center">Guarda-Roupa App</h2>
   <p align="center">
      App mobile que salva suas roupas antes que seja tarde demais.
   </p>
</div>

<div align="center">
   <a href="https://reactnative.dev/">
      <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="ReactNative-badge" style="max-width: 100%;">
   </a>
   <a href="https://expo.dev/">
      <img src="https://img.shields.io/badge/Expo-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="Expo-badge" style="max-width: 100%;">
   </a>
   <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript">
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript-badge" style="max-width: 100%;">
   </a>
</div>

<br>

<div align="center">
   <a href="#sobre-o-projeto">Sobre</a> &#xa0; • &#xa0;
   <a href="#estrutura-do-projeto">Estrutura</a> &#xa0; • &#xa0;
   <a href="#instalação">Instalação</a> &#xa0; • &#xa0;
   <a href="#changelog">Changelog</a>
</div>

----

## Sobre o projeto

O **Guarda-Roupa App** é um aplicativo mobile que resolve um problema cotidiano: recolher ou expor roupas no varal sem depender de "achismos" sobre o tempo antes de ser tarde demais.

A ideia central é combinar uma **API de clima em tempo real** com um **módulo Arduino físico** para automatizar (ou pelo menos facilitar) a decisão de expor e recolher roupas.

### Funcionalidades

- Tela principal com gradiente dinâmico de fundo (baseado na condição climática real)
- Seção **"Hoje"** com previsão climática horária horizontal via API OpenWeatherMap (**probabilidade de chuva** por hora, campo `pop`, em vez de temperatura no card)
- Menu expandido com **calendário**: escolha de dia e previsão horária filtrada a partir do mesmo payload `/forecast`
- **Local manual**: toque no título com cidade para abrir modal (País → Estado → Município); opção de **local padrão** e botão para voltar à **localização atual** (GPS)
- Menu inferior animado com dois estados: **recolhido** (~20% da tela) e **expandido** (~90%)
- Botão flutuante **RECOLHER / EXPOR** na divisa do menu, com animação de linhas irradiando
- Toggle manual do estado do varal (exposto/recolhido)

### Tecnologias utilizadas

#### Core e navegação

<a href="https://reactnative.dev/">
   <img src="https://img.shields.io/badge/React_Native-0.81+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="ReactNative-badge">
</a>
<a href="https://expo.dev/">
   <img src="https://img.shields.io/badge/Expo-54+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="Expo-badge">
</a>
<a href="https://expo.github.io/router/">
   <img src="https://img.shields.io/badge/Expo_Router-6+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoRouter-badge">
</a>

#### Interface e animações

<a href="https://docs.swmansion.com/react-native-reanimated/">
   <img src="https://img.shields.io/badge/Reanimated-4.1+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Reanimated-badge">
</a>
<a href="https://docs.expo.dev/versions/latest/sdk/linear-gradient/">
   <img src="https://img.shields.io/badge/Expo_Linear_Gradient-15+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoLinearGradient-badge">
</a>
<a href="https://icons.expo.fyi/">
   <img src="https://img.shields.io/badge/@expo/vector--icons-13.x-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoVectorIcons-badge">
</a>
<a href="https://github.com/react-native-svg/react-native-svg">
   <img src="https://img.shields.io/badge/react--native--svg-13.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="ReactNativeSVG-badge">
</a>
<a href="https://fonts.google.com/specimen/Nunito">
   <img src="https://img.shields.io/badge/Google_Fonts_(Nunito)-0.4+-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" alt="GoogleFonts-badge">
</a>

#### Dependências externas

<a href="https://openweathermap.org/api">
   <img src="https://img.shields.io/badge/OpenWeatherMap-E96E4E?style=for-the-badge&logo=rainyun&logoColor=white" alt="OpenWeatherMap-badge">
</a>
<a href="https://docs.expo.dev/versions/latest/sdk/location/">
   <img src="https://img.shields.io/badge/Expo_Location-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoLocation-badge">
</a>
<a href="https://axios-http.com">
   <img src="https://img.shields.io/badge/axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios-badge">
</a>
<a href="https://github.com/react-native-async-storage/async-storage">
   <img src="https://img.shields.io/badge/Async_Storage-1.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="AsyncStorage-badge">
</a>

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Estrutura do projeto

```
guardaRoupaApp/
├── app/                              # Roteamento (Expo Router)
│   ├── _layout.jsx                   # Fontes Nunito, loading inicial, StatusBar, Stack
│   └── index.jsx                     # Rota inicial → MainScreen
├── src/
│   ├── components/
│   │   ├── ExpandMenuBtn.jsx         # Botão expandir/recolher menu
│   │   ├── ForecastCalendar.jsx      # Calendário mensal, navegação de mês e seleção de dia (integrado à API)
│   │   ├── HourlyForecast.jsx        # Lista horizontal: hora, ícone, precipitação (%)
│   │   ├── LocationSelectModal.jsx   # Modal: local manual (país/estado/município) e local padrão
│   │   └── ToggleVaralBtn.jsx        # Botão de toggle recolher/expor varal
│   ├── data/
│   │   ├── locationOptions.js        # Opções encadeadas para seleção de local na modal
│   │   └── mockData.js               # Dados mockados
│   ├── hooks/
│   │   └── useWeather.js             # GPS/manual, local padrão (AsyncStorage), OWM (clima + /forecast + cidade)
│   ├── screens/
│   │   └── MainScreen.jsx            # Céu + menu, data selecionada, clima carregado e exibido
│   ├── services/
│   │   ├── arduinoService.js         # Arduino (placeholder)
│   │   └── weatherService.js         # OpenWeatherMap: clima atual, previsão 5d/3h, reverse geocoding (cidade)
│   └── utils/
│       ├── forecastDateUtils.js      # Datas PT-BR, grade do calendário, itens horários (incl. precipitação pop)
│       ├── timeUtils.js              # Formatação de horários
│       └── weatherUtils.js           # Gradiente do céu, ícones e texto de condição
├── constants/
│   └── theme.js                      # Paleta, fontes
├── .editorconfig
├── .env.example
├── CHANGELOG.md
├── eslint.config.js
├── package.json
└── README.md
```

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Instalação

> [!IMPORTANT]
> Certifique-se de ter os seguintes requisitos antes de iniciar:
>
> <a href="https://nodejs.org/">
>    <img src="https://img.shields.io/badge/Node.js-16.0.0+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node-badge">
> </a>
> <a href="https://www.npmjs.com/">
>    <img src="https://img.shields.io/badge/NPM-8.0.0+-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="NPM-badge">
> </a>
> <a href="https://expo.dev/">
>    <img src="https://img.shields.io/badge/Expo%20CLI-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoCLI-badge">
> </a>

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/guardaRoupaApp.git
cd guardaRoupaApp
```

2. Instale as dependências do projeto
```bash
npm install
```

3. Instale o Expo CLI globalmente (caso não tenha)
```bash
npm install -g expo-cli
```

4. Inicie o projeto
```bash
npm start
```

5. Abra no dispositivo escaneando o QR code com o **Expo Go**, ou pressione `w` para abrir no navegador.

### API de clima (OpenWeatherMap)

O app usa a API **OpenWeatherMap**. Sem chave, a previsão não carrega.

1. Crie uma conta em [openweathermap.org/api](https://openweathermap.org/api) e gere uma **API key** (plano gratuito já satisfaz casos de teste do app).
2. Na raiz do projeto, copie o exemplo e crie o arquivo `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edite `.env` e defina:

   ```
   EXPO_PUBLIC_OWM_API_KEY=sua_chave_aqui
   ```

4. **Reinicie o bundler** (`Ctrl+C` e `npm start` de novo). Variáveis `EXPO_PUBLIC_*` só entram após reiniciar o Expo.

5. No dispositivo/emulador, **permita localização** quando o app pedir (o clima usa GPS).

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>

## Changelog

O projeto mantém um histórico de alterações detalhado para cada versão, incluindo:

- Novas funcionalidades adicionadas
- Alterações em funcionalidades existentes
- Correções de bugs

Consulte o [CHANGELOG.md](CHANGELOG.md) para ver o histórico completo de alterações.

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>
