# FaceCheck Service

Serviço para validação de imagens usando a API do ChatGPT. O serviço verifica se uma imagem atende a determinados critérios como:
- Ausência de boné/chapéu
- Boa resolução
- Fundo adequado
- Iluminação apropriada
- Olhar direcionado para a câmera

## Requisitos

- Node.js 14+
- OpenAI API Key

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
PORT=3000
OPENAI_API_KEY=sua_chave_api_aqui
```

## Executando o Serviço

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Uso da API

### Endpoint: POST /validate-image

Envie uma imagem para validação usando multipart/form-data.

**Exemplo usando curl:**
```bash
curl -X POST -F "image=@caminho/para/sua/imagem.jpg" http://localhost:3000/validate-image
```

**Resposta:**
```json
{
  "imagem_valida": true/false,
  "erros": ["lista de erros encontrados"],
  "mensagem": "Mensagem descritiva sobre a validação"
}
```

## Limitações

- Tamanho máximo do arquivo: 5MB
- Formatos aceitos: JPEG, PNG
- Resolução mínima: 800x600 pixels 