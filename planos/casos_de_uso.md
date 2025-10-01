### Documento de Caso de Uso: Gerador de Animação com Pixel.js e React
1. Introdução
Este documento descreve os casos de uso para um sistema de Gerador de Animação web, construído com Pixel.js e React, utilizando Gemini para interpretação de roteiros. O sistema permitirá a criação, gravação e reprodução de animações 2D de personagens e objetos em um cenário teatral multi-plano.
2. Visão Geral do Sistema
O sistema será uma aplicação web interativa onde os usuários podem definir personagens, objetos, cenários e criar sequências de animação manipulando a posição de membros e elementos ao longo do tempo. Um motor de interpretação de roteiros (Gemini) alimentará a cena inicial e as instruções de animação.
3. Atores
 * Artista/Animador: Usuário principal que cria e edita animações.
 * Gerador de Roteiro (Gemini): Sistema externo que fornece descrições de cena e ações.
 * Espectador: Usuário que assiste à animação final (fora do escopo direto de criação, mas um resultado).
4. Casos de Uso
4.1. UC001: Iniciar Nova Animação a partir de Roteiro (via Gemini)
 * Ator Primário: Gerador de Roteiro (Gemini)
 * Pré-condição: O sistema está operacional e aguardando entrada de roteiro.
 * Pós-condição: A cena é inicializada com personagens e objetos conforme o roteiro, em suas posições iniciais e no palco configurado.
 * Fluxo Principal:
   * O Gerador de Roteiro envia um script textual para o sistema.
   * O sistema (componente de interpretação) analisa o script.
   * O sistema identifica os personagens e objetos mencionados.
   * Para cada personagem/objeto identificado, o sistema:
     * Carrega ou cria o modelo visual correspondente.
     * Define a posição inicial no palco.
     * Define o estado inicial (ex: "em pé", "parado").
   * O sistema configura o palco com os planos de fundo e planos de cena conforme especificado ou com padrões.
   * O sistema exibe a cena inicial pronta para edição ou reprodução.
 * Fluxos Alternativos:
   * 4.1.a: Personagem/Objeto Desconhecido: Se um elemento no script não for reconhecido, o sistema pode:
     * Ignorar o elemento.
     * Criar um placeholder genérico.
     * Notificar o Artista/Animador sobre o elemento desconhecido.
4.2. UC002: Criar/Editar Modelo de Personagem
 * Ator Primário: Artista/Animador
 * Pré-condição: O Artista/Animador está na interface de edição de personagem.
 * Pós-condição: Um novo modelo de personagem é salvo ou um modelo existente é atualizado.
 * Fluxo Principal:
   * O Artista/Animador seleciona a opção "Criar Novo Personagem" ou "Editar Personagem Existente".
   * O sistema apresenta um editor visual.
   * O Artista/Animador define os componentes do personagem: cabeça, tronco, braços (esquerdo/direito), pernas (esquerda/direita).
   * Para cada componente, o Artista/Animador pode:
     * Carregar uma imagem/sprite.
     * Definir pontos de pivô (para rotação).
     * Ajustar tamanho e posição relativa.
   * O Artista/Animador salva o modelo de personagem com um nome.
 * Fluxos Alternativos:
   * N/A
4.3. UC003: Criar/Editar Modelo de Objeto
 * Ator Primário: Artista/Animador
 * Pré-condição: O Artista/Animador está na interface de edição de objeto.
 * Pós-condição: Um novo modelo de objeto é salvo ou um modelo existente é atualizado.
 * Fluxo Principal:
   * O Artista/Animador seleciona a opção "Criar Novo Objeto" ou "Editar Objeto Existente".
   * O sistema apresenta um editor visual.
   * O Artista/Animador define o objeto:
     * Carrega uma imagem/sprite.
     * Define pontos de pivô (se aplicável, para pequena movimentação ou rotação).
     * Ajusta tamanho.
   * O Artista/Animador salva o modelo de objeto com um nome.
 * Fluxos Alternativos:
   * N/A
4.4. UC004: Posicionar Elementos no Palco
 * Ator Primário: Artista/Animador
 * Pré-condição: Uma cena foi inicializada (UC001) e o Artista/Animador está no modo de edição.
 * Pós-condição: Personagens e objetos são posicionados nos planos de palco desejados.
 * Fluxo Principal:
   * O Artista/Animador seleciona um personagem ou objeto na cena.
   * O Artista/Animador arrasta e solta o elemento para a posição desejada no palco.
   * O Artista/Animador pode mover o elemento entre os planos de palco (fundo, meio, principal, etc.).
   * O sistema atualiza visualmente a posição do elemento.
 * Fluxos Alternativos:
   * 4.4.a: Ajuste Fino: O Artista/Animador pode usar controles numéricos ou setas do teclado para ajustes precisos de posição e profundidade (Z-index/plano).
4.5. UC005: Gravar Sequência de Poses/Movimento de Personagem
 * Ator Primário: Artista/Animador
 * Pré-condição: Um personagem está presente na cena e o Artista/Animador está no modo de gravação/edição de linha do tempo.
 * Pós-condição: Uma sequência de poses (keyframes) para o personagem selecionado é gravada na linha do tempo.
 * Fluxo Principal:
   * O Artista/Animador seleciona um personagem.
   * O Artista/Animador move o "cabeçote de reprodução" (playhead) na linha do tempo para um ponto específico.
   * O Artista/Animador manipula os membros do personagem (cabeça, tronco, braços, pernas):
     * Arrasta componentes para novas posições.
     * Rotaciona componentes em torno de seus pivôs.
   * O sistema registra automaticamente um keyframe com a nova pose para aquele personagem no tempo atual da linha do tempo.
   * O Artista/Animador repete os passos 2-4 para criar múltiplos keyframes ao longo do tempo.
 * Fluxos Alternativos:
   * 4.5.a: Edição de Keyframe: O Artista/Animador pode selecionar um keyframe existente para ajustá-lo ou excluí-lo.
   * 4.5.b: Interpolação: O sistema pode oferecer opções de interpolação entre keyframes (linear, easing, etc.).
4.6. UC006: Gravar Sequência de Posição/Estado de Objeto
 * Ator Primário: Artista/Animador
 * Pré-condição: Um objeto está presente na cena e o Artista/Animador está no modo de gravação/edição de linha do tempo.
 * Pós-condição: Uma sequência de posições/estados (keyframes) para o objeto selecionado é gravada na linha do tempo.
 * Fluxo Principal:
   * O Artista/Animador seleciona um objeto.
   * O Artista/Animador move o "cabeçote de reprodução" na linha do tempo para um ponto específico.
   * O Artista/Animador manipula o objeto:
     * Arrasta o objeto para uma nova posição.
     * Rotaciona o objeto (se aplicável).
     * Altera o sprite do objeto (se tiver estados diferentes, ex: "lâmpada acesa" vs "lâmpada apagada").
   * O sistema registra automaticamente um keyframe com a nova posição/estado para aquele objeto no tempo atual da linha do tempo.
   * O Artista/Animador repete os passos 2-4 para criar múltiplos keyframes ao longo do tempo.
 * Fluxos Alternativos:
   * 4.6.a: Edição de Keyframe: O Artista/Animador pode selecionar um keyframe existente para ajustá-lo ou excluí-lo.
4.7. UC007: Configurar Planos de Palco
 * Ator Primário: Artista/Animador
 * Pré-condição: Uma cena foi inicializada.
 * Pós-condição: Os planos de palco são configurados (imagens, profundidade).
 * Fluxo Principal:
   * O Artista/Animador acessa as configurações de palco.
   * Para cada plano (fundo, meio, principal, close-up, frente), o Artista/Animador pode:
     * Carregar uma imagem/sprite de fundo.
     * Ajustar a profundidade relativa (Z-index).
     * Ajustar o scroll de paralaxe (opcional, para efeito de profundidade).
   * O sistema atualiza visualmente o palco.
 * Fluxos Alternativos:
   * N/A
4.8. UC008: Pré-visualizar Animação
 * Ator Primário: Artista/Animador
 * Pré-condição: A cena tem keyframes gravados para personagens e/ou objetos.
 * Pós-condição: A animação é reproduzida visualmente para revisão.
 * Fluxo Principal:
   * O Artista/Animador clica no botão "Play" ou "Pré-visualizar".
   * O sistema move o cabeçote de reprodução pela linha do tempo.
   * Para cada quadro, o sistema interpola as posições e estados dos personagens e objetos entre os keyframes e renderiza a cena usando Pixel.js.
   * A animação é exibida em tempo real na tela.
 * Fluxos Alternativos:
   * 4.8.a: Controles de Reprodução: O Artista/Animador pode pausar, parar, avançar/retroceder quadro a quadro.
4.9. UC009: Salvar/Carregar Projeto de Animação
 * Ator Primário: Artista/Animador
 * Pré-condição: O Artista/Animador criou ou editou uma animação.
 * Pós-condição: O projeto de animação é salvo ou carregado.
 * Fluxo Principal (Salvar):
   * O Artista/Animador clica em "Salvar" ou "Salvar Como".
   * O sistema coleta todos os dados da cena (modelos de personagens/objetos, keyframes, configurações de palco).
   * O sistema serializa esses dados (ex: JSON).
   * O Artista/Animador pode baixar o arquivo ou o sistema pode salvá-lo em um armazenamento persistente (ex: banco de dados local/remoto).
 * Fluxo Principal (Carregar):
   * O Artista/Animador clica em "Carregar Projeto".
   * O Artista/Animador seleciona um arquivo de projeto ou escolhe um projeto salvo.
   * O sistema desserializa os dados.
   * O sistema recria a cena, os personagens, objetos e a linha do tempo com base nos dados carregados.
 * Fluxos Alternativos:
   * N/A
5. Requisitos Não Funcionais
 * Performance: A renderização das animações deve ser fluida (mínimo de 30 FPS, idealmente 60 FPS) usando Pixel.js.
 * Responsividade: A interface do usuário (React next.js) deve ser responsiva e adaptável a diferentes tamanhos de tela (embora focado em desktop para criação).
 * Usabilidade: A interface deve ser intuitiva para artistas e animadores, com feedback visual claro.
 * Escalabilidade: O sistema deve ser capaz de gerenciar cenas com um número razoável de personagens e objetos sem degradação significativa de performance.
 * Compatibilidade: Funcionar nos navegadores web modernos (Chrome, Firefox, Edge, Safari).