
Termo de Referência para Desenvolvimento de Aplicativo Digital 

Sistema Sustentabilizar - Plataforma de Certificação Ambiental e Rastreamento de Resíduos 

---

1. Objeto 

Contratação de serviço técnico especializado para o desenvolvimento de aplicativo digital multiplataforma (Android e iOS), destinado à operacionalização do Sistema Sustentabilizar, com foco na certificação ambiental progressiva, rastreabilidade de resíduos sólidos urbanos e incentivo econômico por meio de sistema de pontuação (moeda social). 

---

2. Contextualização 

O Sistema Sustentabilizar constitui uma solução sociotécnica aplicada à gestão de resíduos sólidos urbanos, integrando: 

* Certificação ambiental baseada em evidências; 


* Monitoramento contínuo de indicadores ambientais; 


* Rastreabilidade georreferenciada de resíduos; 


* Incentivo econômico ao gerador por meio de moeda social. 



A plataforma deverá superar modelos tradicionais baseados em autodeclaração, adotando validação por evidência documental e visual, garantindo confiabilidade e auditabilidade dos dados. 

---

3. Objetivo do Aplicativo 

Desenvolver uma aplicação digital capaz de: 

* Registrar e monitorar práticas de segregação de resíduos; 


* Validar evidências ambientais em tempo real; 


* Classificar usuários em níveis de certificação (Bronze, Prata e Ouro); 


* Gerar relatórios técnicos automatizados; 


* Operacionalizar sistema de incentivo econômico baseado em pontuação. 



---

4. Escopo Funcional do Sistema 

O sistema deverá ser estruturado em módulos integrados, conforme descrito a seguir: 

### 4.1. 

Módulo de Cadastro 

Permitir o registro de diferentes perfis de usuários: 

* Pessoa física (munícipe); 


* Pessoa jurídica (empresas); 


* Eventos; 


* Órgãos públicos; 


* Cooperativas/catadores; 


* Auditores. 



**Funcionalidades:** 

* Cadastro com CPF/CNPJ; 


* Geolocalização automática; 


* Classificação por tipologia de gerador. 



### 4.2. 

Módulo de Checklist Inteligente 

Sistema dinâmico de avaliação baseado em critérios de certificação: 

* Perguntas adaptativas por tipo de usuário; 


* Estrutura de pontuação automatizada; 


* Vinculação direta aos níveis: 
    - Bronze
    - Prata
    - Ouro. 



### 4.3. 

Módulo de Registro de Evidências 

Elemento central do sistema. 

**Funcionalidades obrigatórias:** 

* Upload de imagens com 
    - Data automática
    - Hora automática 
    - Geolocalização automática; 


* Upload de documentos: 
    - MTR (Manifesto de Transporte de Resíduos)
    - Notas fiscais 
    - Comprovantes de destinação. 



**Objetivo:** 

* Garantir rastreabilidade e validação técnica da certificação. 



### 4.4. 

Módulo de Registro de Resíduos 

Permitir inserção de dados quantitativos: 

* Tipo de resíduo; 


* Peso (kg); 


* Volume estimado; 


* Frequência de coleta. 



O sistema deverá calcular automaticamente: 

* Percentual de desvio de aterro; 


* Indicadores de desempenho ambiental; 


* Evolução temporal dos dados. 



### 4.5. 

Módulo de Rastreabilidade 

Registrar o fluxo completo dos resíduos: 

* Origem (gerador); 


* Transporte; 


* Destinação final. 



**Funcionalidades:** 

* Histórico completo por lote; 


* Vinculação com documentos comprobatórios; 


* Visualização em linha do tempo. 



### 4.6. 

Módulo de Moeda Social (Sistema de Pontuação) 

Conversão de resíduos em créditos digitais. 

**Funcionalidades:** 

* Sistema de pontuação por tipo de resíduo; 


* Geração de saldo individual; 


* Registro de uso dos créditos. 



**Aplicações previstas:** 

* Comércio local credenciado; 


* Feiras municipais; 


* Incentivos públicos. 



### 4.7. 

Módulo de Certificação Automática 

Sistema de classificação baseado em dados registrados. 

**Funcionalidades:** 

* Análise automática de critérios; 


* Definição do nível de certificação; 


* Emissão de certificado digital contendo: 
    - Identificação do usuário
    - Nível atingido
    - Data de validade 
    - QR Code de verificação. 



### 4.8. 

Módulo de Relatórios 

Geração automatizada de documentos técnicos: 

* Relatório ambiental individual; 


* Relatório consolidado para gestão pública; 


* Indicadores alinhados aos Objetivos de Desenvolvimento Sustentável (ODS). 



### 4.9. 

Módulo de Gamificação 

Recursos para engajamento dos usuários: 

* Sistema de pontuação adicional; 


* Ranking de participantes; 


* Metas de desempenho; 


* Recompensas simbólicas. 



---

5. Fluxo Operacional do Sistema 

O aplicativo deverá contemplar o seguinte fluxo: 

1. Cadastro do usuário; 


2. Diagnóstico inicial (baseline); 


3. Registro contínuo de práticas e evidências; 


4. Monitoramento automático dos indicadores; 


5. Validação dos critérios de certificação; 


6. Classificação do nível (Bronze, Prata ou Ouro); 


7. Emissão do certificado digital; 


8. Manutenção e reavaliação periódica. 



---

6. Requisitos Técnicos 

O sistema deverá atender aos seguintes requisitos: 

* Plataforma mobile (Android e iOS); 


* Interface intuitiva e responsiva; 


* Armazenamento em nuvem; 


* Segurança de dados conforme LGPD; 


* Funcionamento com baixa conectividade (modo offline parcial); 


* Sincronização automática de dados; 


* Integração com geolocalização (GPS). 



**Tecnologias sugeridas:** 

* Flutter (desenvolvimento multiplataforma); 


* Firebase ou similar (backend). 



---

7. Produtos Esperados 

* Aplicativo funcional (versão beta e final); 


* Painel administrativo (opcional); 


* Banco de dados estruturado; 


* Manual técnico de uso; 


* Código-fonte documentado; 


* Suporte inicial para implementação piloto. 



---

8. Prazo de Execução 

O desenvolvimento deverá ocorrer em etapas: 

* 
**Fase 1:** Protótipo (30-60 dias); 


* 
**Fase 2:** Versão beta (60-90 dias); 


* 
**Fase 3:** Versão final (até 120 dias). 



---

9. Critérios de Aceitação 

O sistema será considerado apto quando: 

* Todas as funcionalidades descritas estiverem operacionais; 


* Os dados forem armazenados com integridade; 


* O sistema gerar certificação automática baseada em evidências; 


* Os relatórios forem emitidos corretamente. 



---

10. Considerações Finais 

O aplicativo Sustentabilizar não se configura como ferramenta de coleta seletiva convencional, mas como um sistema digital de certificação ambiental baseado em evidências, com rastreabilidade e incentivo econômico integrado, voltado à gestão urbana sustentável e à economia circular. 

**Responsável pelo projeto:** 

* Pesquisadora vinculada ao Programa de Pós-Graduação em Clima e Energia - UENF.