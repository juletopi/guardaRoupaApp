<div align="center">
   <h2 align="center">Guarda-Roupa App</h2>
   <p align="center">
      App mobile que detecta chuva via integração com módulo Arduino e API de clima.
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
- Seção **"Hoje"** com previsão climática horária horizontal via API OpenWeatherMap
- Menu inferior animado com dois estados: **recolhido** (~20% da tela) e **expandido** (~90%)
- Botão flutuante **RECOLHER / EXPOR** na divisa do menu, com animação de linhas irradiando
- Toggle manual do estado do varal (exposto/recolhido)
- Localização automática via GPS com nome de cidade resolvido por reverse geocoding (OWM)

### Tecnologias utilizadas

<a href="https://reactnative.dev/">
   <img src="https://img.shields.io/badge/React_Native-0.81+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="ReactNative-badge">
</a>
<a href="https://expo.dev/">
   <img src="https://img.shields.io/badge/Expo-54+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="Expo-badge">
</a>
<a href="https://expo.github.io/router/">
   <img src="https://img.shields.io/badge/Expo_Router-6+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoRouter-badge">
</a>
<a href="https://docs.swmansion.com/react-native-reanimated/">
   <img src="https://img.shields.io/badge/Reanimated-4.1+-764ABC?style=for-the-badge&logo=react&logoColor=white" alt="Reanimated-badge">
</a>
<a href="https://docs.expo.dev/versions/latest/sdk/linear-gradient/">
   <img src="https://img.shields.io/badge/Expo_Linear_Gradient-15+-5A29E4?style=for-the-badge&logo=expo&logoColor=white" alt="ExpoLinearGradient-badge">
</a>
<a href="https://fonts.google.com/specimen/Nunito">
   <img src="https://img.shields.io/badge/Google_Fonts_(Nunito)-0.4+-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" alt="GoogleFonts-badge">
</a>

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
