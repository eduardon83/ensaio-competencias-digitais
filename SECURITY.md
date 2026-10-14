# Segurança

O Ensaio às Competências Digitais (ECD) é público e de código aberto. A segurança não depende de segredo do código, só dos segredos do Worker (ver `docs/aldeia-digital/SEGURANCA.md`).

## Comunicar uma vulnerabilidade

Não abra um pedido ("issue") público. Use a comunicação privada do GitHub:
**Security → Report a vulnerability** em https://github.com/eduardon83/ensaio-competencias-digitais/security/advisories/new

Inclua o que encontrou, os passos para o reproduzir e o impacto que estima. Respondemos o mais depressa possível e avisamos quando a correção estiver publicada.

Não teste contra o sítio publicado com força bruta, criação massiva de turmas ou envio de emails: use o ambiente local (`npx wrangler dev --local`, ver `README.txt`).

## Âmbito

- A aplicação web (`src/`) e o Worker da Cloudflare (`worker/`), incluindo a API da Aldeia Digital (`/api/aldeia/…`).
- O ponto de recolha de estatísticas de referência (`telemetria/apps-script.gs`).

## Em caso de incidente (Aldeia Digital)

1. Pôr a variável `ALDEIA_ESTADO` em `so-leitura` ou `fechada` (no painel do Worker, sem novo deploy).
2. Rodar os segredos afetados (`PIMENTA_PROFESSOR`, `CHAVE_TOKENS`, `RESEND_CHAVE`).
3. Avaliar se houve acesso a dados pessoais. Se sim, notificar a CNPD em 72 horas e informar as escolas.
