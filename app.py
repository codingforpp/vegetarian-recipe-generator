import re
import os

import requests
import streamlit as st


ENV_FILE = ".env"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_MODEL = "chat-latest"

SYSTEM_PROMPT = """
You are a vegetarian recipe assistant. You only create strictly vegetarian recipes.
Never include meat, fish, seafood, eggs, chicken, animal stock, gelatin, lard, or meat-based sauces.
If the user provides any non-vegetarian ingredient, refuse politely and ask for vegetarian ingredients.
Always provide clear measurements and full cooking instructions from start to finish.
Keep recipes simple, practical, and suitable for home cooking.
Prefer Indian flavors when appropriate, but follow the user's cuisine preference.

You must always use exactly this format:

Recipe Name:
Short Description:
Servings:
Prep Time:
Cook Time:

Ingredients:
- Ingredient with exact measurement
- Ingredient with exact measurement

Optional Ingredients:
- Optional item with quantity

Instructions:
1. Step-by-step instruction
2. Step-by-step instruction
3. Continue until complete

Tips:
- Practical cooking tip

Substitutions:
- Ingredient alternative

Vegetarian Safety Check:
- Confirm that the recipe contains no meat, fish, eggs, or seafood
""".strip()

BANNED_TERMS = [
    "egg",
    "eggs",
    "chicken",
    "beef",
    "pork",
    "lamb",
    "mutton",
    "fish",
    "prawn",
    "prawns",
    "shrimp",
    "crab",
    "lobster",
    "seafood",
    "bacon",
    "ham",
    "turkey",
    "duck",
    "meat",
    "gelatin",
    "lard",
    "anchovy",
    "oyster sauce",
    "fish sauce",
    "chicken stock",
    "beef stock",
]

BANNED_PATTERN = re.compile(
    r"\b(?:"
    + "|".join(re.escape(term) for term in BANNED_TERMS)
    + r")\b",
    re.IGNORECASE,
)


def contains_banned_terms(text: str) -> bool:
    return bool(BANNED_PATTERN.search(text or ""))


def recipe_output_passes_safety_check(recipe_text: str) -> bool:
    if not recipe_text.strip():
        return False

    for raw_line in recipe_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        # Allow the model to explicitly confirm absence of banned items.
        if re.search(r"\b(no|without|free of|does not contain|contains no)\b", line, re.IGNORECASE):
            continue

        if contains_banned_terms(line):
            return False

    return True


def load_env_file(file_path: str = ENV_FILE) -> None:
    if not os.path.exists(file_path):
        return

    with open(file_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = value


def get_openai_api_key() -> str:
    env_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if env_key:
        return env_key

    try:
        secret_key = st.secrets.get("OPENAI_API_KEY", "")
    except Exception:
        secret_key = ""

    return str(secret_key).strip()


def build_user_prompt(
    ingredients: str,
    cuisine: str,
    cooking_time: str,
    skill_level: str,
    servings: int,
) -> str:
    cuisine_text = cuisine if cuisine != "Any" else "No specific cuisine preference"
    time_text = cooking_time if cooking_time != "Any" else "Any reasonable cooking time"

    return f"""
Create one simple strictly vegetarian recipe based on the user's input.

User input:
- Ingredients or key ingredient: {ingredients}
- Cuisine preference: {cuisine_text}
- Cooking time: {time_text}
- Skill level: {skill_level}
- Servings: {servings}

Rules:
- Strictly vegetarian only
- No eggs, fish, meat, chicken, seafood, gelatin, lard, or animal stock
- Dairy is allowed unless the user explicitly asks for vegan food
- Use practical ingredients and realistic measurements
- Keep the recipe concise but complete
- Make sure the measurements scale to the requested servings
- Prefer Indian flavor profiles when they fit the request
- If the user input is not enough for a full recipe, fill in common pantry ingredients sensibly

Return only the recipe in the required format.
""".strip()


def build_alternative_prompt(
    ingredients: str,
    cuisine: str,
    cooking_time: str,
    skill_level: str,
    servings: int,
    original_recipe: str,
) -> str:
    cuisine_text = cuisine if cuisine != "Any" else "No specific cuisine preference"
    time_text = cooking_time if cooking_time != "Any" else "Any reasonable cooking time"

    return f"""
Create two additional, clearly different, strictly vegetarian recipe options based on the same user input.

User input:
- Ingredients or key ingredient: {ingredients}
- Cuisine preference: {cuisine_text}
- Cooking time: {time_text}
- Skill level: {skill_level}
- Servings: {servings}

Current recipe to avoid repeating too closely:
{original_recipe}

Rules:
- Strictly vegetarian only
- No eggs, fish, meat, chicken, seafood, gelatin, lard, or animal stock
- Dairy is allowed unless the user explicitly asks for vegan food
- Make the two alternatives meaningfully different from the current recipe and from each other
- Use practical ingredients and realistic measurements
- Keep each recipe concise but complete
- Make sure the measurements scale to the requested servings

Return exactly in this format:

=== ALTERNATIVE 1 ===
Recipe Name:
Short Description:
Servings:
Prep Time:
Cook Time:

Ingredients:
- Ingredient with exact measurement

Optional Ingredients:
- Optional item with quantity

Instructions:
1. Step-by-step instruction

Tips:
- Practical cooking tip

Substitutions:
- Ingredient alternative

Vegetarian Safety Check:
- Confirm that the recipe contains no meat, fish, eggs, or seafood

=== ALTERNATIVE 2 ===
Recipe Name:
Short Description:
Servings:
Prep Time:
Cook Time:

Ingredients:
- Ingredient with exact measurement

Optional Ingredients:
- Optional item with quantity

Instructions:
1. Step-by-step instruction

Tips:
- Practical cooking tip

Substitutions:
- Ingredient alternative

Vegetarian Safety Check:
- Confirm that the recipe contains no meat, fish, eggs, or seafood
""".strip()


def call_openai(prompt: str) -> str:
    api_key = get_openai_api_key()
    if not api_key:
        raise ValueError("Missing OPENAI_API_KEY")

    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "max_completion_tokens": 900,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(OPENAI_API_URL, json=payload, headers=headers, timeout=45)
    response.raise_for_status()
    data = response.json()
    return (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )


def split_alternative_recipes(response_text: str) -> list[str]:
    parts = re.split(r"===\s*ALTERNATIVE\s+\d+\s*===", response_text, flags=re.IGNORECASE)
    recipes = [part.strip() for part in parts if part.strip()]
    return recipes[:2]


def parse_recipe_sections(recipe_text: str) -> tuple[dict[str, list[str]], list[str]]:
    section_names = {
        "Recipe Name",
        "Short Description",
        "Servings",
        "Prep Time",
        "Cook Time",
        "Ingredients",
        "Optional Ingredients",
        "Instructions",
        "Tips",
        "Substitutions",
        "Vegetarian Safety Check",
    }

    sections: dict[str, list[str]] = {}
    ordered_sections: list[str] = []
    current_section = "Recipe Name"
    sections[current_section] = []
    ordered_sections.append(current_section)

    for raw_line in recipe_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if ":" in line:
            label, remainder = line.split(":", 1)
            label = label.strip()
            remainder = remainder.strip()

            if label in section_names:
                current_section = label
                if current_section not in sections:
                    sections[current_section] = []
                    ordered_sections.append(current_section)
                if remainder:
                    sections[current_section].append(remainder)
                continue

        sections.setdefault(current_section, []).append(line)

    return sections, ordered_sections


def render_section_lines(lines: list[str]) -> None:
    for line in lines:
        if re.match(r"^\d+\.", line):
            st.markdown(line)
        else:
            st.markdown(line)


def render_ingredient_lines(lines: list[str]) -> None:
    ingredient_lines = [line for line in lines if line.strip()]
    if len(ingredient_lines) < 8:
        render_section_lines(ingredient_lines)
        return

    midpoint = (len(ingredient_lines) + 1) // 2
    left_lines = ingredient_lines[:midpoint]
    right_lines = ingredient_lines[midpoint:]

    col1, col2 = st.columns(2)
    with col1:
        render_section_lines(left_lines)
    with col2:
        render_section_lines(right_lines)


def render_recipe(recipe_text: str) -> None:
    sections, ordered_sections = parse_recipe_sections(recipe_text)

    st.markdown("### Generated Recipe")

    recipe_name = " ".join(sections.get("Recipe Name", [])).strip()
    short_description = " ".join(sections.get("Short Description", [])).strip()

    if recipe_name:
        st.subheader(recipe_name)
    if short_description:
        st.caption(short_description)

    meta_parts = []
    for label in ["Servings", "Prep Time", "Cook Time"]:
        value = " ".join(sections.get(label, [])).strip()
        if value:
            meta_parts.append(f"**{label}:** {value}")
    if meta_parts:
        st.markdown(" | ".join(meta_parts))

    primary_sections = [
        section
        for section in ["Ingredients", "Optional Ingredients", "Instructions"]
        if section in sections and sections[section]
    ]

    if primary_sections:
        tabs = st.tabs(primary_sections)
        for tab, section in zip(tabs, primary_sections):
            with tab:
                if section in {"Ingredients", "Optional Ingredients"}:
                    render_ingredient_lines(sections[section])
                else:
                    render_section_lines(sections[section])

    for section in ordered_sections:
        if section in {"Recipe Name", "Short Description", "Servings", "Prep Time", "Cook Time"}:
            continue
        if section in primary_sections:
            continue
        if not sections.get(section):
            continue

        with st.expander(section, expanded=(section == "Vegetarian Safety Check")):
            render_section_lines(sections[section])


def generate_recipe_from_prompt(prompt: str) -> str:
    recipe_text = call_openai(prompt)
    if not recipe_text:
        raise ValueError("No recipe returned")
    if not recipe_output_passes_safety_check(recipe_text):
        raise ValueError("Recipe failed vegetarian safety check")
    return recipe_text


def main() -> None:
    load_env_file()
    state = st.session_state
    state.setdefault("recipe_options", [])
    state.setdefault("selected_recipe_label", "Recipe 1")
    state.setdefault("last_request_signature", "")

    st.set_page_config(
        page_title="Simple Vegetarian Recipe Generator",
        layout="centered",
    )

    st.title("Simple Vegetarian Recipe Generator")
    st.caption(
        "Generate simple vegetarian recipes from ingredients you already have or one key ingredient."
    )

    with st.container():
        ingredients = st.text_area(
            "Enter ingredients or one key ingredient",
            placeholder="Examples: paneer, potato, spinach, tomato",
            height=120,
        )

        col1, col2 = st.columns(2)
        with col1:
            cuisine = st.selectbox(
                "Cuisine preference",
                ["Indian", "Italian", "Asian", "Mexican", "Any"],
                index=0,
            )
            skill_level = st.selectbox("Skill level", ["Easy", "Medium"], index=0)

        with col2:
            cooking_time = st.selectbox(
                "Cooking time",
                ["15 min", "30 min", "45 min", "Any"],
                index=1,
            )
            servings = st.number_input(
                "Servings",
                min_value=1,
                max_value=12,
                value=2,
                step=1,
            )

        generate = st.button("Generate Recipe", type="primary", use_container_width=True)

    st.markdown("---")

    request_signature = "||".join(
        [
            ingredients.strip(),
            cuisine,
            cooking_time,
            skill_level,
            str(servings),
        ]
    )

    if generate:
        cleaned_ingredients = ingredients.strip()

        if not cleaned_ingredients:
            st.error("Please enter ingredients or one key ingredient to generate a recipe.")
            return

        if contains_banned_terms(cleaned_ingredients):
            st.error(
                "This app only supports strictly vegetarian recipes. Please remove non-vegetarian ingredients and try again."
            )
            return

        user_prompt = build_user_prompt(
            ingredients=cleaned_ingredients,
            cuisine=cuisine,
            cooking_time=cooking_time,
            skill_level=skill_level,
            servings=servings,
        )

        with st.spinner("Generating your vegetarian recipe..."):
            try:
                recipe_text = generate_recipe_from_prompt(user_prompt)
            except ValueError as exc:
                error_message = str(exc)
                if error_message == "No recipe returned":
                    st.error("No recipe was returned by OpenAI. Please try again.")
                elif error_message == "Recipe failed vegetarian safety check":
                    st.error(
                        "The generated recipe did not pass the vegetarian safety check. Please try again."
                    )
                else:
                    st.error(
                        "Missing OpenAI API key. Set OPENAI_API_KEY in your local .env file or Streamlit secrets and try again."
                    )
                return
            except requests.exceptions.ConnectionError:
                st.error("Could not connect to OpenAI. Please check your internet connection and try again.")
                return
            except requests.exceptions.Timeout:
                st.error("The OpenAI request timed out. Please try again.")
                return
            except requests.exceptions.HTTPError as exc:
                error_text = ""
                response = getattr(exc, "response", None)
                if response is not None:
                    try:
                        error_payload = response.json().get("error", {})
                        if isinstance(error_payload, dict):
                            error_text = error_payload.get("message", "")
                        else:
                            error_text = str(error_payload)
                    except ValueError:
                        error_text = response.text
                st.error(
                    f"OpenAI returned an error. {error_text or 'Please verify your API key, billing, and configured model.'}"
                )
                return
            except requests.exceptions.RequestException as exc:
                st.error(f"An unexpected network error occurred: {exc}")
                return

        state["recipe_options"] = [{"label": "Recipe 1", "content": recipe_text}]
        state["selected_recipe_label"] = "Recipe 1"
        state["last_request_signature"] = request_signature

    if state["recipe_options"] and state["last_request_signature"] != request_signature:
        st.info("The form inputs changed. Generate again to refresh recipe options.")

    if state["recipe_options"]:
        recipe_labels = [option["label"] for option in state["recipe_options"]]
        selected_label = st.selectbox(
            "Choose a recipe",
            recipe_labels,
            index=recipe_labels.index(state["selected_recipe_label"])
            if state["selected_recipe_label"] in recipe_labels
            else 0,
        )
        state["selected_recipe_label"] = selected_label

        selected_recipe = next(
            option["content"] for option in state["recipe_options"] if option["label"] == selected_label
        )
        render_recipe(selected_recipe)

        if len(state["recipe_options"]) == 1:
            if st.button("Show 2 more recipe options", use_container_width=True):
                cleaned_ingredients = ingredients.strip()
                alternative_prompt = build_alternative_prompt(
                    ingredients=cleaned_ingredients,
                    cuisine=cuisine,
                    cooking_time=cooking_time,
                    skill_level=skill_level,
                    servings=servings,
                    original_recipe=state["recipe_options"][0]["content"],
                )

                with st.spinner("Finding two more vegetarian recipe options..."):
                    try:
                        alternatives_text = call_openai(alternative_prompt)
                    except ValueError:
                        st.error(
                            "Missing OpenAI API key. Set OPENAI_API_KEY in your local .env file or Streamlit secrets and try again."
                        )
                        return
                    except requests.exceptions.ConnectionError:
                        st.error("Could not connect to OpenAI. Please check your internet connection and try again.")
                        return
                    except requests.exceptions.Timeout:
                        st.error("The OpenAI request timed out. Please try again.")
                        return
                    except requests.exceptions.HTTPError as exc:
                        error_text = ""
                        response = getattr(exc, "response", None)
                        if response is not None:
                            try:
                                error_payload = response.json().get("error", {})
                                if isinstance(error_payload, dict):
                                    error_text = error_payload.get("message", "")
                                else:
                                    error_text = str(error_payload)
                            except ValueError:
                                error_text = response.text
                        st.error(
                            f"OpenAI returned an error. {error_text or 'Please verify your API key, billing, and configured model.'}"
                        )
                        return
                    except requests.exceptions.RequestException as exc:
                        st.error(f"An unexpected network error occurred: {exc}")
                        return

                alternative_recipes = []
                for recipe_text in split_alternative_recipes(alternatives_text):
                    if recipe_output_passes_safety_check(recipe_text):
                        alternative_recipes.append(recipe_text)

                if not alternative_recipes:
                    st.error("No safe alternative recipes were returned. Please try again.")
                    return

                for idx, recipe_text in enumerate(alternative_recipes, start=2):
                    state["recipe_options"].append(
                        {"label": f"Recipe {idx}", "content": recipe_text}
                    )
                state["selected_recipe_label"] = "Recipe 2"
                st.rerun()

if __name__ == "__main__":
    main()
