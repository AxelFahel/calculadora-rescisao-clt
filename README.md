# Calculadora de Rescisão CLT

Sistema web moderno para **cálculo estimativo** de rescisão trabalhista CLT no Brasil.

> ⚠️ **Aviso Legal**: Os cálculos são estimativos e podem variar por convenção coletiva, descontos, faltas, adicionais, verbas variáveis e decisões judiciais. Não substituem análise contábil ou jurídica especializada.

## 🚀 Stack

- **Vue 3** + **Vite** + **TypeScript**
- **Pinia** (gerenciamento de estado)
- **Vue Router 4** (roteamento SPA)
- **Tailwind CSS v3** (estilização)
- **Day.js** (datas)
- **Zod** (validação de formulários)
- **Vitest** (testes unitários)

## 📁 Estrutura do projeto

```
src/
├── app/
│   └── router.ts           # Rotas da aplicação
├── components/
│   ├── forms/              # Etapas do wizard
│   │   ├── Step1DadosContrato.vue
│   │   ├── Step2Desligamento.vue
│   │   ├── Step3VerbasFgts.vue
│   │   └── Step4Documentos.vue
│   ├── ui/                 # Componentes reutilizáveis
│   │   ├── AppAlert.vue
│   │   ├── AppButton.vue
│   │   ├── AppCard.vue
│   │   ├── AppModal.vue
│   │   ├── AppStepper.vue
│   │   ├── ThemeToggle.vue
│   │   └── ToggleSwitch.vue
│   ├── results/
│   └── uploads/
├── domain/
│   └── rescisao/
│       ├── types.ts        # Tipos TypeScript centrais
│       ├── regras.ts       # Constantes e regras-base CLT
│       ├── calculos.ts     # Motor de cálculo puro
│       └── validacoes.ts   # Schemas Zod
├── stores/
│   ├── rescisao.store.ts   # Estado do cálculo atual
│   └── historico.store.ts  # Histórico (localStorage)
├── utils/
│   ├── currency.ts         # Formatação de moeda BRL
│   ├── dates.ts            # Formatação de datas
│   └── files.ts            # Validação de arquivos
└── views/
    ├── HomeView.vue         # Dashboard
    ├── NewCalculationView.vue # Wizard 5 etapas
    ├── ResultView.vue       # Resultado detalhado
    └── HistoryView.vue      # Histórico
tests/
└── domain/rescisao/
    └── calculos.test.ts    # Testes unitários do motor
```

## ⚙️ Instalação e uso

```bash
# Clonar/entrar na pasta
cd calculadora-rescisao-clt

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar testes unitários
npm test

# Build para produção
npm run build
```

## 🧮 Verbas calculadas

| Verba | Fórmula | Observações |
|-------|---------|-------------|
| Saldo de salário | `salário / 30 × dias` | Dias trabalhados no mês da rescisão |
| Aviso prévio | `30 + (3 × anos_completos)` dias, máx. 90 | Lei 12.506/2011 |
| 13º proporcional | `salário / 12 × avos` | Meses com ≥ 15 dias = mês cheio |
| Férias proporcionais | `salário / 12 × avos + 1/3` | 1/3 constitucional incluído |
| Férias vencidas | `salário × períodos + 1/3` | Por período não gozado |
| Multa FGTS | 40% (sem justa causa) / 20% (acordo) / 0% (outros) | Sobre saldo FGTS informado |

## 📋 Tipos de rescisão suportados

- ✅ Demissão sem justa causa
- ✅ Pedido de demissão
- ✅ Acordo entre empregado e empregador (Art. 484-A CLT)
- ✅ Término de contrato de experiência
- ✅ Rescisão por justa causa
- ✅ Rescisão antecipada de contrato determinado

## 🔐 Privacidade e segurança

- Documentos processados **100% no cliente** (FileReader API)
- **Nenhum arquivo** é enviado a servidores externos
- Apenas dados de cálculo são salvos no `localStorage` (sem arquivos)
- Nomes de arquivos são sanitizados
- Tipos MIME e tamanho validados no frontend

## 📌 FGTS Digital

Para desligamentos a partir de **01/03/2024**, os recolhimentos rescisórios de FGTS devem ser realizados pelo sistema **FGTS Digital** do Governo Federal (fgtsd.digital.gov.br).

## 🧪 Testes

```bash
npm test            # Executa todos os testes
npm run test:watch  # Modo watch
```

Cobertura inclui:
- Aviso prévio proporcional (0, 1, 5, 10, 20+ anos)
- Saldo de salário (manual e automático)
- 13º proporcional (avos, adiantamento)
- Férias proporcionais e vencidas (com 1/3)
- Multa FGTS (40%, 20%, 0%, manual)
- Cenários completos por tipo de rescisão

## 🗺️ Roadmap futuro

- [ ] OCR automático de documentos (carteira de trabalho, holerites)
- [ ] Backend com autenticação e criptografia
- [ ] Cálculo de INSS e IRRF sobre verbas
- [ ] Exportação de PDF nativa via biblioteca
- [ ] Suporte a convenções coletivas por categoria
- [ ] API pública para integração com sistemas RH

## ⚠️ Aviso legal completo

Este sistema é uma ferramenta de **uso exclusivamente informativo**. Os cálculos são estimativas baseadas nas regras gerais da CLT e podem diferir dos valores oficiais por:

- Convenções coletivas de trabalho
- Descontos de INSS, IRRF e contribuições sindicais
- Faltas não justificadas e afastamentos
- Adicionais contratuais (periculosidade, insalubridade, noturno)
- Verbas variáveis (comissões, prêmios, gorjetas)
- Decisões judiciais e súmulas do TST

**Consulte sempre um advogado trabalhista ou contador para rescisões oficiais.**
