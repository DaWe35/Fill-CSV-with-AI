# Fill CSV with AI

This project uses AI to fill CSV files with generated content using the OpenRouter API.

It will generate a new column based on your `input prompt + input column`. Each cell is processed one-by-one in a separate API call, so there is no size limit, but it can burn some credits haha.

## Prerequisites

- Docker and Docker Compose
- OpenRouter API key (get it from https://openrouter.ai/)

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your configuration:
   - Add your OpenRouter API key
   - Configure the input/output CSV columns
   - Customize the AI prompt template

3. Place your input CSV file in the `data` directory

## Usage

1. Start the application:
   ```bash
   docker compose up
   ```

2. The script will:
   - Read the input CSV file
   - Process each row using the AI model
   - Generate a new CSV file with the AI responses
   - Save the result as `input_processed.csv` in the data directory

## Example

Input CSV (`data/input.csv`):
```csv
id,description
1,"The quick brown fox jumps over the lazy dog"
2,"To be, or not to be, that is the question"
```

Output CSV (`data/input_processed.csv`):
```csv
id,description,ai_response
1,"The quick brown fox jumps over the lazy dog","Analysis: This is a pangram containing every letter of the English alphabet..."
2,"To be, or not to be, that is the question","Analysis: This famous quote from Shakespeare's Hamlet explores themes of existence..."
```
