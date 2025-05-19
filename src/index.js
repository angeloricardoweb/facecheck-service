require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { OpenAI } = require('openai');
const sharp = require('sharp');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  },
}).any(); // This will accept any field name

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.post('/validate-image', upload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        imagem_valida: false,
        erros: ['Nenhuma imagem foi enviada'],
        mensagem: 'Por favor, envie uma imagem para validação'
      });
    }

    const file = req.files[0]; // Get the first file uploaded

    // Convert image to base64
    const base64Image = file.buffer.toString('base64');

    // Get image dimensions
    const metadata = await sharp(file.buffer).metadata();

    // Prepare the prompt for ChatGPT
    const prompt = `Analise esta imagem e verifique os seguintes critérios:
    2. Tamanho e Resolução
- Resolução mínima: 640x480 pixels
- Tamanho máximo do arquivo: 2MB
3. Detecção Facial
- A imagem deve conter um único rosto detectado
- O rosto deve estar completamente visível, sem cortes ou obstruções
4. Enquadramento do Rosto
- Rosto centralizado na imagem
- Olhos alinhados na horizontal, na altura central da imagem
- O rosto deve ocupar entre 60% e 80% da altura da imagem
    5. Qualidade da Imagem
- A imagem deve estar nítida, sem desfoque ou tremores
- Iluminação uniforme, sem áreas muito escuras ou claras demais
- Sem sombras no rosto ou reflexos que atrapalhem a visualização
6. Expressão e Aparência
- Expressão neutra ou séria, sem sorrisos exagerados
- Olhos abertos e boca fechada
- Sem uso de:
- Óculos escuros ou com reflexo
- Bonés, chapéus, máscaras ou qualquer item que cubra o rosto
7. Fundo da Imagem
- Fundo claro e liso, de preferência branco, cinza ou azul claro
- Não deve haver objetos, móveis ou outras pessoas no fundo
8. Ambiente da Captura
- Foto feita em ambiente bem iluminado, preferencialmente com luz natural ou luz frontal
- Evitar contra-luz (ex: janelas atrás da pessoa)
- Recomendável usar a câmera frontal do celular
    
    Responda em formato JSON com a seguinte estrutura:
    {
      "imagem_valida": boolean,
      "erros": string[],
      "mensagem": string
    }`;

    const response = await openai.chat.completions.create({
      // free model
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${file.mimetype};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    // Parse the response from ChatGPT
    const validationResult = JSON.parse(response.choices[0].message.content);

    // Add resolution check
    if (metadata.width < 800 || metadata.height < 600) {
      validationResult.imagem_valida = false;
      validationResult.erros.push('Resolução muito baixa. Mínimo necessário: 800x600 pixels');
    }

    res.json(validationResult);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      imagem_valida: false,
      erros: ['Erro ao processar a imagem'],
      mensagem: 'Ocorreu um erro ao validar a imagem'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 