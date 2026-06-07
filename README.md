# Simple Vegetarian Recipe Generator

A simple local Streamlit app that generates strictly vegetarian recipes using ChatGPT through the OpenAI API.

## Features

- Strict vegetarian input validation before the model is called
- Strict vegetarian safety check on the model output
- Simple recipe generation from a list of ingredients or one key ingredient
- Configurable OpenAI model in one place
- Clean Streamlit interface with mobile-friendly layout

## Requirements

- Python 3.10+
- An [OpenAI API key](https://platform.openai.com/api-keys)

## OpenAI setup

1. Create or sign in to your OpenAI account at [platform.openai.com](https://platform.openai.com/).
2. Generate an API key.
3. Store it in [`.env`](/C:/Projects/recipe_app/.env):

```text
OPENAI_API_KEY=your_openai_api_key
```

You can also set it in your shell if you prefer:

```powershell
$env:OPENAI_API_KEY="your_openai_api_key"
```

For Command Prompt:

```cmd
set OPENAI_API_KEY=your_openai_api_key
```

By default the app uses `chat-latest`, which OpenAI documents as the latest instant model currently used in ChatGPT. If you prefer a different OpenAI model, update `OPENAI_MODEL` near the top of [app.py](/C:/Projects/recipe_app/app.py).

## Deploy to Streamlit Community Cloud

1. Put this project in a GitHub repository.
2. Make sure [`.env`](/C:/Projects/recipe_app/.env) is not committed. This repo includes [`.gitignore`](/C:/Projects/recipe_app/.gitignore) for that.
3. Push your code to GitHub.
4. In Streamlit Community Cloud, create a new app from that GitHub repo.
5. In the Streamlit app settings, add a secret:

```toml
OPENAI_API_KEY="your_openai_api_key"
```

The app will read `OPENAI_API_KEY` from Streamlit secrets in the cloud, or from [`.env`](/C:/Projects/recipe_app/.env) when running locally.

## Install Python dependencies

```bash
pip install -r requirements.txt
```

## Run the app

```bash
streamlit run app.py
```

The app calls OpenAI at:

```text
https://api.openai.com/v1/chat/completions
```

## Example inputs

- `potato, spinach, tomato`
- `paneer`
- `rice, carrots, peas`
- `chickpeas`

## Notes

- This app only supports strictly vegetarian recipes.
- If you enter non-vegetarian ingredients, the app will reject the request.
- Dairy is allowed unless the user explicitly asks for vegan food in the input.
- If `OPENAI_API_KEY` is missing or invalid, the app will show a helpful error message.
- The app will automatically load `OPENAI_API_KEY` from [`.env`](/C:/Projects/recipe_app/.env) if present.
- For Streamlit Community Cloud, store `OPENAI_API_KEY` in app secrets instead of committing it to GitHub.
