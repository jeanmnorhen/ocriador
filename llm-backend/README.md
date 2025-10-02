# LLM Backend Service

Este serviço executa um modelo de linguagem local para processar roteiros de animação.

## Setup

1.  **Baixar o Modelo de Linguagem:**

    É necessário baixar o modelo `CodeLlama-7B-Instruct-GGUF` quantizado. Recomenda-se a versão `Q4_K_M`.

    *   **Link para Download:** [TheBloke/CodeLlama-7B-Instruct-GGUF](https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF/blob/main/codellama-7b-instruct.Q4_K_M.gguf)
    *   **Destino:** Salve o arquivo baixado (`codellama-7b-instruct.Q4_K_M.gguf`) dentro do diretório `llm-backend/models/`.

2.  **Configurar Variáveis de Ambiente:**

    Copie o arquivo `.env.example` para `.env` na raiz do projeto e preencha os valores:

    ```bash
    cp .env.example .env
    ```

    Edite o arquivo `.env` com suas configurações.

3.  **Iniciar os Serviços:**

    Com o Docker e o Docker Compose instalados, execute o seguinte comando na raiz do projeto:

    ```bash
    docker-compose up --build
    ```
