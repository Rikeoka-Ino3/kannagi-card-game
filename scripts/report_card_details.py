import re
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Card:
    id: str
    name: str
    attribute: str
    season: str
    cost: int | None
    power: int | None
    summon_src: str
    attack_src: str
    passive_src: str


def extract_block(text: str, start_pat: str) -> str:
    m = re.search(start_pat, text)
    if not m:
        raise RuntimeError(f"pattern not found: {start_pat}")
    start = m.end()
    # find the next array end
    end = text.find("];", start)
    if end == -1:
        raise RuntimeError("array end not found")
    return text[start:end]


def split_objects(array_body: str) -> list[str]:
    objs: list[str] = []
    depth = 0
    buf: list[str] = []
    inside = False
    for ch in array_body:
        if ch == "{":
            depth += 1
            inside = True
        if inside:
            buf.append(ch)
        if ch == "}" and inside:
            depth -= 1
            if depth == 0:
                objs.append("".join(buf))
                buf = []
                inside = False
    return objs


def get_str(obj: str, key: str) -> str:
    m = re.search(rf"{re.escape(key)}\s*:\s*\"([^\"]+)\"", obj)
    return m.group(1) if m else ""


def get_int(obj: str, key: str) -> int | None:
    m = re.search(rf"{re.escape(key)}\s*:\s*([0-9]+)", obj)
    return int(m.group(1)) if m else None


def get_src(obj: str, key: str) -> str:
    # best-effort: grab from "key:" until next top-level key or end of object
    m = re.search(rf"{re.escape(key)}\s*:\s*([\s\S]*?)(?=\n\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:|\n\s*}})", obj)
    return (m.group(1).strip() if m else "")


def summarize_effect(src: str) -> str:
    if not src:
        return ""
    s = " ".join(src.split())

    # Simple pattern summaries
    m = re.search(r"applyDamage\(\s*foe\s*,\s*([0-9]+)\s*\)", s)
    if m:
        return f"相手に{m.group(1)}点ダメージ"
    m = re.search(r"applyDamage\(\s*self\s*,\s*([0-9]+)\s*\)", s)
    if m:
        return f"自分に{m.group(1)}点ダメージ"
    m = re.search(r"self\.hp\s*\+\=\s*([0-9]+)", s)
    if m:
        return f"自分HP+{m.group(1)}"
    m = re.search(r"foe\.hp\s*\+\=\s*([0-9]+)", s)
    if m:
        return f"相手HP+{m.group(1)}"
    m = re.search(r"drawN\(\s*self\s*,\s*\"自分\"\s*,\s*([0-9]+)\s*\)", s)
    if m:
        return f"自分{m.group(1)}枚ドロー"
    m = re.search(r"drawN\(\s*foe\s*,\s*\"相手\"\s*,\s*([0-9]+)\s*\)", s)
    if m:
        return f"相手{m.group(1)}枚ドロー"
    m = re.search(r"exileFromSoul\(\s*foe\s*,\s*([0-9]+)", s)
    if m:
        return f"相手の魂を{m.group(1)}枚除外（条件あり得る）"
    m = re.search(r"exileTopDeck\(\s*self\s*\)", s)
    if m:
        return "自分山札上1枚除外"
    m = re.search(r"exileTopDeck\(\s*foe\s*\)", s)
    if m:
        return "相手山札上1枚除外"

    # If it returns a literal, show that
    rm = re.search(r"return\s+`([^`]+)`", src, re.S)
    if rm:
        return rm.group(1).strip()
    rm = re.search(r"return\s+\"([^\"]+)\"", src, re.S)
    if rm:
        return rm.group(1).strip()
    return "（要目視：コード式）"


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    main_js = root / "main.js"
    text = main_js.read_text(encoding="utf-8")

    body = extract_block(text, r"const imageCardCatalog\s*=\s*\[")
    objs = split_objects(body)

    cards: list[Card] = []
    for o in objs:
        cid = get_str(o, "id")
        name = get_str(o, "name")
        attr = get_str(o, "attribute")
        season = get_str(o, "season")
        cost = get_int(o, "cost")
        power = get_int(o, "power")
        summon_src = get_src(o, "summonEffect") or get_src(o, "effect")
        attack_src = get_src(o, "attackEffect")
        passive_src = get_src(o, "passive")
        cards.append(
            Card(
                id=cid,
                name=name,
                attribute=attr,
                season=season,
                cost=cost,
                power=power,
                summon_src=summon_src,
                attack_src=attack_src,
                passive_src=passive_src,
            )
        )

    # Print table
    print("|ID|名前|種類|季節|cost|power|発動タイミング|効果サマリ|")
    print("|-|-|-|-|-:|-:|-|-|")
    for c in cards:
        timing = []
        summary = []
        if c.passive_src:
            timing.append("継続")
            summary.append(f"継続: {summarize_effect(c.passive_src)}")
        if c.summon_src:
            timing.append("召喚時")
            summary.append(f"召喚: {summarize_effect(c.summon_src)}")
        if c.attack_src:
            timing.append("攻撃時")
            summary.append(f"攻撃: {summarize_effect(c.attack_src)}")
        timing_s = " / ".join(timing) if timing else "-"
        summary_s = "<br>".join(summary) if summary else "-"
        cost_s = "" if c.cost is None else str(c.cost)
        power_s = "" if c.power is None else str(c.power)
        print(f"|{c.id}|{c.name}|{c.attribute}|{c.season}|{cost_s}|{power_s}|{timing_s}|{summary_s}|")


if __name__ == "__main__":
    main()

