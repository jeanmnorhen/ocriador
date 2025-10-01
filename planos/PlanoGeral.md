## Plano de Implementação Vercel: Gerador de Animação 
Next.js e Pixel.js 
I. Fundamentos Arquiteturais na Vercel 
A Vercel será a Compute Platform e o Global CDN do projeto. Utilizaremos o Next.js App 
Router como base, pois ele permite a desagregação da lógica entre Server Components (para 
acesso seguro a dados) e o Cliente (onde o Pixel.js será executado). 
Pilares de Performance (TTFB Low-Latency): 
1. Incremental Static Regeneration (ISR): O padrão de renderização primário. Usaremos 
ISR para servir modelos de personagem (cabeça, braços, pernas) e configurações de 
palco (planos de fundo) a partir do CDN da Vercel. Isso garante o menor Time to First 
Byte (TTFB) possível, pois a maioria dos dados de leitura é servida estaticamente, 
preservando as valiosas CPU-horas dinâmicas. 
2. Server Components: Usados para fazer data fetching diretamente do Supabase no lado 
do servidor, mantendo as chaves de API em segredo. 
3. Client Components: Onde a biblioteca Pixel.js será inicializada e onde a lógica interativa 
(arrastar e soltar, timeline, pré-visualização) será executada. 
II. Plano de Implementação: Mapeamento de Casos de Uso (UCs) 
O plano de implementação está dividido em cinco fases, focando na infraestrutura, persistência 
e, finalmente, na lógica de negócio dos casos de uso. 
Fase 1: Configuração e Infraestrutura (Vercel, Supabase, R2) 
Etapa 
1.1 
Caso de Uso/Objetivo Descrição Técnica 
(Vercel/Next.js) 
Setup do Projeto Vercel Inicializar um projeto 
Next.js com o App 
Router e integrar com o 
repositório Git. 
Configurar 
NEXT_PUBLIC_SUPA
 BASE_URL e 
SUPABASE_SERVICE
 _KEY como 
Serviço Envolvido 
Vercel 
Environment Variables 
na Vercel para 
ambientes Preview e 
Production. 
1.2 
Configuração do R2 
(Assets) 
Criar um bucket no 
Cloudflare R2 para 
Cloudflare R2 
Etapa Caso de Uso/Objetivo Descrição Técnica 
(Vercel/Next.js) 
Serviço Envolvido 
armazenar todos os 
sprites de personagens 
e fundos de palco 
(UC002, UC003, 
UC007). 
1.3 Custom Image Loader Implementar um 
Custom Loader no 
next.config.js para que 
o componente <Image 
/> do Next.js aponte 
diretamente para o 
endpoint público do 
Cloudflare R2. (Isso é 
crucial para o 
desempenho e evita 
limites de otimização 
de imagem da Vercel). 
Next.js / Vercel 
1.4 Autenticação Base Implementar a 
autenticação de 
desenvolvedor/artista 
usando o pacote 
@supabase/ssr para 
gerenciar sessões via 
cookies seguros no 
servidor. 
Vercel / Supabase Auth 
Fase 2: Estrutura de Dados e Modelagem (UC002, UC003, UC007) 
Esta fase implementa a persistência dos elementos estáticos do projeto. 
Etapa Caso de Uso/Objetivo Estrutura de Dados 
(Supabase/Postgres) 
Ponto de Integração 
Vercel 
2.1 Modelagem de 
Personagem (UC002) 
Criar a tabela 
personagens 
(metadados: nome, 
sprite_id_cabeca, 
ponto_pivo_braco, 
etc.). Os IDs de sprite 
referenciam os objetos 
no R2. 
Server Component no 
/personagem/[id]/edit 
usando ISR para 
carregar a definição. 
2.2 Modelagem de Objeto 
(UC003) 
Criar a tabela objetos 
(metadados: nome, 
sprite_id, 
movimento_permitido - 
bool). 
Server Component no 
/objeto/[id]/edit usando 
ISR para carregar a 
definição. 
2.3 Modelagem de Palco 
(UC007) 
Criar a tabela palcos 
(metadados: nome, 
Server Component na 
rota principal de 
Etapa Caso de Uso/Objetivo Estrutura de Dados 
(Supabase/Postgres) 
Ponto de Integração 
Vercel 
plano_fundo_url, 
plano_principal_url, 
plano_frente_url). 
URLs de ativos 
apontam para o R2. 
edição, com revalidate: 
3600 (1 hora) para o 
conteúdo estático do 
palco. 
2.4 Camada de Gravação 
(UC005, UC006) 
Criar a tabela 
keyframes (estrutura de 
tempo: projeto_id, 
tempo_frame, 
personagem_id, 
dados_pose (JSONB) 
). 
Preparar o endpoint de 
escrita via Server 
Action (Fase 4). 
Fase 3: Renderização Interativa (Pixel.js / React) 
Esta fase foca na lógica client-side que é o cerne da animação. 
Etapa Caso de Uso/Objetivo Descrição Técnica 
(Next.js/React Client) 
Detalhe Pixel.js 
3.1 Inicialização do Canvas Criar um Client 
Component principal 
(e.g., <AnimationEditor 
/>) que inicializa o 
motor Pixel.js (ou 
PixiJS) no useEffect. 
O Canvas deve ocupar 
100% da área de 
edição, com o motor 
renderizando os 5 
planos de palco 
(profundidade Z-index). 
3.2 Carregamento de 
Elementos 
O Client Component 
recebe dados de 
modelos do Server 
Component via props. 
Os sprites são 
carregados do R2 via 
URL. 
Implementar a lógica 
de composição: 
desenhar cabeça, 
tronco, braços e pernas 
como objetos 
aninhados, respeitando 
os pontos de pivô. 
3.3 Interação (UC004) Implementar event 
handlers (mouse/touch) 
no Canvas para 
permitir que o usuário 
arraste e solte (drag 
and drop) os elementos 
e membros de 
personagem. 
A manipulação da 
posição e rotação dos 
objetos Pixel.js deve 
ser sincronizada com o 
estado local do React. 
Fase 4: Persistência de Poses (UC005, UC006, UC009) 
Esta é a fase mais dinâmica e que consome o Active CPU Time da Vercel. A prioridade é a 
eficiência das funções de escrita. 
Etapa Caso de Uso/Objetivo Descrição Técnica 
(Server Actions / 
Supabase) 
Otimização de 
Performance (Vercel) 
4.1 Gravação de 
Keyframes (UC005, 
UC006) 
Implementar uma 
Server Action 
assíncrona 
(createKeyframe(projet
 oId, time, poseData)). 
Esta função recebe o 
estado da pose e o 
salva na tabela 
keyframes do 
Supabase. 
CRÍTICO: A lógica de 
escrita 
(INSERT/UPSERT) 
deve ser ultrarrápida. 
Use stored procedures 
(Postgres Functions) 
no Supabase para 
encapsular a lógica de 
banco de dados e 
minimizar o tempo de 
execução da Vercel 
Function. 
4.2 Salvamento de Projeto 
(UC009) 
Implementar uma 
Server Action para 
salvar metadados do 
projeto (duração total, 
título). 
A Vercel limita as 
Serverless Functions a 
60 segundos no plano 
Hobby , mas a lógica 
de gravação do estado 
deve durar 
milissegundos. 
Monitore o consumo 
das 4 CPU-horas 
mensais. 
4.3 Leitura da Timeline 
(UC008) 
Implementar um 
endpoint de API 
(Server Action ou 
Route Handler) para 
carregar todos os 
keyframes de um 
projeto específico. 
Esta chamada inicial de 
leitura não deve usar 
ISR. Use o cache de 
leitura do Next.js 
(padrão fetch do App 
Router) e garanta que 
o Supabase responda 
rapidamente. 
Fase 5: Integração Gemini e Animação 
Etapa Caso de Uso/Objetivo Descrição Técnica 
(Fluxo de Lógica) 
Local de Execução 
5.1 Processar Roteiro 
(UC001) 
Criação de uma 
Serverless Function 
dedicada (ou Server 
Action) que recebe o 
script de texto do 
Gemini e o analisa. 
Vercel Serverless 
Function (Função de 
backend dedicada). 
5.2 Inicialização da Cena A função de análise 
(5.1) deve então: a) 
Consultar personagens 
e objetos no Supabase. 
Servidor 
(Vercel/Supabase) 
Etapa 
5.3 
Caso de Uso/Objetivo Descrição Técnica 
(Fluxo de Lógica) 
b) Gerar o keyframe 
inicial (tempo = 0) com 
as posições sugeridas 
pelo script. c) Retornar 
o projeto_id e o estado 
inicial para o Client 
Component. 
Reprodução (UC008) No Client Component, 
após carregar todos os 
keyframes (4.3), o 
Pixel.js deve interpolar 
os dados de pose 
(posição e rotação de 
membros) entre os 
keyframes ao longo do 
tempo. 
III. Segurança e Governança 
Local de Execução 
Cliente (Browser / 
Pixel.js) 
Para manter a integridade do sistema, as seguintes regras devem ser aplicadas: 
A. Gerenciamento de Segredos (Vercel) 
● Chaves de API (Supabase): Devem ser configuradas no Dashboard da Vercel. O 
SUPABASE_SERVICE_KEY (chave de privilégio total) deve ser usado apenas nos 
Server Components e Server Actions. 
● Acesso do Cliente: O NEXT_PUBLIC_SUPABASE_ANON_KEY (chave anônima) é 
usada no lado do cliente, mas deve ser protegida por Row Level Security (RLS) no 
Supabase para garantir que o cliente só possa ler os dados que lhe são permitidos 
(evitando acesso à tabela de secrets ou de outros usuários). 
B. Observabilidade (Vercel) 
Embora o plano Hobby tenha limitações no Monitoring e na retenção de logs (apenas 1 hora de 
logs) , é crucial monitorar o consumo dos recursos: 
● Active CPU Time: Monitorar semanalmente. Se o consumo das 4 CPU-horas se 
aproximar de 3.5 horas, é um sinal claro de que as Server Actions estão sendo 
executadas com muita frequência ou estão muito lentas, exigindo otimização das 
consultas ao Supabase. 
● Edge Requests: Os 1 milhão de Edge Requests (incluindo Edge Functions e 
Middleware) devem ser reservados principalmente para middleware de autenticação e 
requisições de API. 
Este plano, ao priorizar o ISR para a entrega de ativos e a eficiência das Server Actions para a 
gravação, maximiza a performance do projeto dentro das capacidades da Vercel. 
Referências citadas 
1. ISR on Vercel is now faster and more cost-efficient, 
https://vercel.com/blog/isr-on-vercel-is-now-faster-and-more-cost-efficient 2. Vercel Hobby Plan, 
https://vercel.com/docs/plans/hobby 3. Use Supabase with Next.js, 
https://supabase.com/docs/guides/getting-started/quickstarts/nextjs 4. Environment variables - 
Vercel, https://vercel.com/docs/environment-variables 5. Monitoring - Vercel, 
https://vercel.com/docs/query/monitoring 6. Observability - Vercel, 
https://vercel.com/docs/observability 7. Breaking down Vercel's 2025 pricing plans quotas and 
hidden costs - Flexprice, https://flexprice.io/blog/vercel-pricing-breakdown 