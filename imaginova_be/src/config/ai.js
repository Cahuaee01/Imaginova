import OpenAI from "openai";
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

async function generateChallenge(month, day) {
  try {
    // Modifica del prompt per impostarlo alla data odierna
    let prompt = process.env.AI_PROMPT;
    prompt = prompt.replace(/MESE/g, month);
    prompt = prompt.replace('GIORNO', day);

    logger.info('Prompt: ', prompt);

    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     { role: 'user', content: prompt },
    //   ],
    // });
    
    // const result = response.choices[0].message.content;
    // logger.info('Risultato:', result);
    
    // // Separo le frasi in base ai ritorni a capo
    // const sentences = result.split('\n').map(sentence => sentence.trim()).filter(sentence => sentence !== '');
    
    // // Creo due array: uno per i titoli e uno per le descrizioni
    // const titles = [];
    // const descriptions = [];
    
    // // Estraggo i titoli e le descrizioni
    // sentences.forEach(sentence => {
    //   // Divido la frase al primo ":" per ottenere il titolo e la descrizione
    //   const parts = sentence.split(':', 2).map(part => part.trim());  // Limita a 2 parti
    //   if (parts.length === 2) {
    //     titles.push(parts[0]);
    //     descriptions.push(parts[1]);
    //   }
    // });
    
    // // Creo la matrice (ogni colonna è un titolo e la sua descrizione)
    // const matrix = titles.map((title, index) => [title, descriptions[index]]);
    // logger.info(`Matrice di sfide generate: ${matrix}`);
    
    // return matrix;    

    const impostor_matrix = [
      [
        'Thanksgiving Feast',
        'Write a haiku about your favorite Thanksgiving dish or capture a photo of your festive table spread'
      ],
      [
        'November 14',
        'Share a short story or poem inspired by the autumn colors of the trees on this day'
      ],
      [
        'Movember',
        "Pen a limerick about your favorite mustache style or snap a pic of someone rocking a bold 'stache in support of men's health awareness"
      ]
    ];

    return impostor_matrix;
    
  } catch (error) {
    logger.error(`Error while generating Challenge: ${error}`, { stack: error.stack });
  }
}

export { generateChallenge };
