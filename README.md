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
[![Google Fonts](<https://img.shields.io/badge/Google_Fonts_(Nunito)-4285F4?style=for-the-badge&logo=google&logoColor=white>)](https://fonts.google.com/specimen/Nunito)

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

O projeto mantém um histórico de alterações detalhado para cada versão, incluindo:

- Novas funcionalidades adicionadas
- Alterações em funcionalidades existentes
- Correções de bugs

Consulte o [CHANGELOG.md](CHANGELOG.md) para ver o histórico completo de alterações.

<div align="left">
   <h6><a href="#guarda-roupa-app"> Voltar para o início ↺</a></h6>
</div>
