import re
import markupsafe
import db


def slugify(text):
    if not text:
        return ""
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def get_unique_slug(table, base_slug, exclude_id=None):
    slug = base_slug or "item"
    counter = 1
    while True:
        query = f"SELECT id FROM {table} WHERE slug = %s"
        params = [slug]
        if exclude_id:
            query += " AND id != %s"
            params.append(exclude_id)
        if not db.query_one(query, params):
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def get_store_settings():
    try:
        rows = db.query("SELECT key, value FROM store_settings")
        return {r["key"]: r["value"] for r in rows}
    except Exception:
        return {"cod_enabled": "true", "online_payment_enabled": "false"}


# ─── Jinja2 globals / filters ──────────────────────────────────────────────────

def resolve_image(image_url):
    from flask import url_for
    if not image_url:
        return url_for("static", filename="images/placeholder.png")
    if image_url.startswith("http"):
        return image_url
    return url_for("static", filename=f"images/{image_url.lstrip('/')}")


def _strip_html(text):
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = clean.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<')
    clean = re.sub(r'\n+', '\n', clean)
    return re.sub(r' +', ' ', clean).strip()


def format_description(text):
    if not text:
        return ""
    text = _strip_html(text)
    text = text.replace("\\n", "\n").replace("\r\n", "\n").replace("\r", "\n")
    rows, paras = [], []
    for line in [l.strip() for l in text.split("\n")]:
        if not line:
            continue
        m = re.match(r"^[•*-]?\s*(.+?)\s*:-\s*(.+)$", line)
        if m:
            rows.append((m.group(1).strip(), m.group(2).strip()))
        else:
            paras.append(re.sub(r"^[•*-]\s*", "", line))
    parts = []
    if rows:
        trs = "".join(
            f'<tr><td class="desc-key">{markupsafe.escape(k)}</td>'
            f'<td class="desc-val">{markupsafe.escape(v)}</td></tr>'
            for k, v in rows
        )
        parts.append(f'<table class="desc-table"><tbody>{trs}</tbody></table>')
    parts += [f'<p class="desc-para">{markupsafe.escape(p)}</p>' for p in paras]
    return markupsafe.Markup("".join(parts))


def format_short_desc(text):
    if not text:
        return ""
    text = _strip_html(text)
    text = text.replace("\\n", "\n").replace("\r\n", "\n").replace("\r", "\n")
    lines = [re.sub(r"^[•*-]\s*", "", l.strip()) for l in text.split("\n") if l.strip()]
    return markupsafe.Markup(
        "".join(f'<p class="short-desc-line">{markupsafe.escape(l)}</p>' for l in lines)
    )


def register_jinja(app):
    app.jinja_env.globals["resolve_image"] = resolve_image
    app.jinja_env.filters["format_description"] = format_description
    app.jinja_env.filters["format_short_desc"] = format_short_desc
