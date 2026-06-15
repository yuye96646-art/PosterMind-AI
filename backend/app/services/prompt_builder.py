def build_prompt(
    style_prompt_template: str,
    title: str,
    subtitle: str,
    content: str,
    advanced_prompt: str = "",
    width: int = 1242,
    height: int = 1660,
) -> str:
    """Build a background generation prompt using template + user content."""
    prompt = style_prompt_template.format(
        title=title or "Modern Design",
        subtitle=subtitle or "",
        content=content or "",
        width=width,
        height=height,
    )
    if advanced_prompt:
        prompt += f", {advanced_prompt}"
    return prompt
