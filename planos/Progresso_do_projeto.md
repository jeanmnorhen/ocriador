### Progresso do projeto

**Fase 1: Configuração e Infraestrutura (Vercel, Supabase, R2)**
- [x] **1.1 Setup do Projeto Vercel:** Projeto Next.js com App Router, TypeScript e Tailwind CSS inicializado. Repositório Git integrado.
- [ ] **1.2 Configuração do R2 (Assets):** (Aguardando criação manual do bucket no Cloudflare R2)
- [x] **1.3 Custom Image Loader:** Loader customizado (`image-loader.ts`) para Cloudflare R2 implementado e configurado no `next.config.ts`.
- [x] **1.4 Autenticação Base:** Pacote `@supabase/ssr` instalado e configurado. Criados clientes para browser, servidor e middleware. Implementada página de login (`/login`) com Server Action para autenticação.

**Fase 2: Estrutura de Dados e Modelagem (UC002, UC003, UC007)**
- [x] **2.1 a 2.4 Modelagem de Dados:** Script `setup.sql` gerado contendo as tabelas `projetos`, `palcos`, `personagens`, `objetos` e `keyframes`.
- [ ] **Status:** Aguardando a execução do script `setup.sql` no ambiente Supabase para a criação das tabelas e aplicação das políticas de segurança.

**Fase 3: Renderização Interativa (Pixel.js / React)**
- [x] **3.1 Inicialização do Canvas:** Biblioteca `pixi.js` instalada. Criado o componente `<AnimationEditor />` que inicializa o canvas do PixiJS. A página principal foi configurada como uma rota protegida que renderiza o editor.
- [x] **3.2 Carregamento de Elementos:** Refatorada a UI para um dashboard de projetos e uma página de editor dinâmica. Implementado painel para criação de personagens com `sprite_url`. Editor agora carrega e exibe os sprites dos personagens no palco.
- [x] **3.3 Interação (UC004):** Sprites no palco agora são interativos e podem ser arrastados e soltos (drag and drop) com o mouse.

**Fase 4: Persistência de Poses (UC005, UC006, UC009)**
- [x] **4.1 Gravação de Keyframes:** Criada a `Server Action` `saveKeyframe`. Criado o componente `<Timeline />`. O editor foi refatorado para um componente de cliente (`EditorClient`) que orquestra a captura de posição dos sprites e o salvamento de keyframes.
- [x] **4.3 Leitura da Timeline:** A página do editor agora busca os keyframes do projeto. O editor usa keyframes para posicionar sprites inicialmente. O componente de timeline exibe os frames com keyframes salvos.

**Fase 5: Integração Gemini e Animação**
- [x] **5.1 Processar Roteiro (UC001):** Criada a `Server Action` `processScript` e adicionada UI para entrada de roteiro no `EditorClient`.
- [ ] **5.2 Inicialização da Cena:** (Próximo passo)
- [ ] **5.3 Reprodução (UC008):** (Próximo passo)