import { parse } from 'csv-parse'
import { stringify } from 'csv-stringify'
import { createReadStream, createWriteStream } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const {
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
  CSV_INPUT_FILE,
  CSV_INPUT_COLUMN,
  PROMPT_TEMPLATE
} = process.env

if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL || !CSV_INPUT_FILE || !CSV_INPUT_COLUMN || !PROMPT_TEMPLATE) {
  console.error('Missing required environment variables')
  process.exit(1)
}

async function callOpenRouterAPI(input) {
  const prompt = PROMPT_TEMPLATE.replace('{input}', input)
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/dawe35/fill-csv-with-ai',
        'X-Title': 'Fill CSV with AI'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenRouter API:', error)
    return null
  }
}

async function processCSV() {
  const records = []
  const parser = createReadStream(CSV_INPUT_FILE).pipe(parse({
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true // Allow inconsistent column counts
  }))

  for await (const record of parser) {
    // Remove existing ai_response if it exists and add a new one
    delete record.ai_response
    record.ai_response = ''
    records.push(record)
  }

  console.log(`Processing ${records.length} records...`)

  for (const record of records) {
    const inputValue = record[CSV_INPUT_COLUMN]
    if (!inputValue || inputValue.trim() === '') {
      console.log('Skipping empty record...')
      record.ai_response = 'No input provided'
      continue
    }

    console.log(`Processing record: ${inputValue.substring(0, 50)}...`)
    const aiResponse = await callOpenRouterAPI(inputValue)
    record.ai_response = aiResponse || 'Error: Failed to get AI response'
  }

  const currentDate = new Date().toISOString().split('T')[0]
  const outputFile = `output_${currentDate}.csv`
  const stringifier = stringify({ header: true })
  const writeStream = createWriteStream(outputFile)

  stringifier.pipe(writeStream)
  
  for (const record of records) {
    stringifier.write(record)
  }

  stringifier.end()
  console.log(`Processing complete. Output saved to ${outputFile}`)
}

processCSV().catch(console.error) 