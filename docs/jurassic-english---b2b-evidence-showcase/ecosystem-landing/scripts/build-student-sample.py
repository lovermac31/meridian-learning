from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


OUT = Path(__file__).parents[1] / "public/downloads/jurassic-student-academy-sample.pdf"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("DeckSans", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DeckSans-Bold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))

WIDTH, HEIGHT = A4
NAVY = HexColor("#1E4D3B")
AMBER = HexColor("#B45309")
INK = HexColor("#1C2526")
MUTED = HexColor("#4A5568")
PAPER = HexColor("#FAF7F2")
LINE = HexColor("#E6DEC8")
GREEN = HexColor("#E6F4EA")


def box(pdf, x, y, width, height, fill, stroke=None, radius=12):
    pdf.setFillColor(fill)
    pdf.setStrokeColor(stroke or fill)
    pdf.roundRect(x, y, width, height, radius, fill=1, stroke=bool(stroke))


def paragraph(pdf, text, x, y, max_width, *, font="DeckSans", size=10.5, leading=16, color=INK):
    pdf.setFont(font, size)
    pdf.setFillColor(color)
    line = ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if pdfmetrics.stringWidth(candidate, font, size) > max_width and line:
            pdf.drawString(x, y, line)
            y -= leading
            line = word
        else:
            line = candidate
    if line:
        pdf.drawString(x, y, line)
        y -= leading
    return y


def header(pdf, page):
    box(pdf, 40, HEIGHT - 98, WIDTH - 80, 54, NAVY, radius=14)
    pdf.setFillColor(HexColor("#F6C453"))
    pdf.setFont("DeckSans-Bold", 8.5)
    pdf.drawString(56, HEIGHT - 64, "JURASSIC ENGLISH  |  STUDENT ACADEMY")
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.drawRightString(WIDTH - 56, HEIGHT - 64, f"ILLUSTRATIVE SAMPLE  ·  {page}/2")
    pdf.setFillColor(MUTED)
    pdf.setFont("DeckSans", 7.2)
    pdf.drawString(42, 28, "Original demonstration activity · Not a real student response or level placement")
    pdf.drawRightString(WIDTH - 42, 28, "jurassicenglish.com/student-academy/resources")


def ruled_lines(pdf, x, y, width, count, gap=25):
    pdf.setStrokeColor(LINE)
    for index in range(count):
        pdf.line(x, y - index * gap, x + width, y - index * gap)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUT), pagesize=A4)
    pdf.setTitle("Maya's Last Flare — Jurassic English Student Academy Sample")
    pdf.setAuthor("Jurassic English")
    pdf.setSubject("Original illustrative story-thinking activity")

    # Page 1
    header(pdf, 1)
    pdf.setFillColor(AMBER)
    pdf.setFont("DeckSans-Bold", 9)
    pdf.drawString(44, HEIGHT - 130, "READ  ·  THINK  ·  SUPPORT YOUR IDEA")
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 24)
    pdf.drawString(44, HEIGHT - 166, "Maya's last flare")
    y = paragraph(
        pdf,
        "A short story-thinking activity for learners. Read the situation, make a choice, and show how you reached it.",
        44, HEIGHT - 193, WIDTH - 88, size=10.5, leading=16, color=MUTED,
    )
    box(pdf, 42, y - 135, WIDTH - 84, 119, PAPER, LINE, radius=14)
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 10.5)
    pdf.drawString(58, y - 40, "THE SITUATION")
    paragraph(
        pdf,
        "A storm is moving toward the coast. Maya has one dry flare left. She can save it to signal a rescue boat for herself, or fire it now so a fishing crew can see the reef ahead.",
        58, y - 63, WIDTH - 116, size=10.4, leading=16,
    )
    y -= 166
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 12)
    pdf.drawString(44, y, "1  ANALYZE")
    y = paragraph(pdf, "What choice is Maya facing? Who could be affected by each option?", 44, y - 22, WIDTH - 88, size=9.8, leading=15)
    ruled_lines(pdf, 44, y - 3, WIDTH - 88, 3, 24)
    y -= 82
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 12)
    pdf.drawString(44, y, "2  EVALUATE")
    y = paragraph(pdf, "Which option seems stronger right now? What might Maya gain or risk with each choice?", 44, y - 22, WIDTH - 88, size=9.8, leading=15)
    ruled_lines(pdf, 44, y - 3, WIDTH - 88, 3, 24)
    y -= 83
    box(pdf, 44, y - 59, WIDTH - 88, 50, GREEN, radius=10)
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 9)
    pdf.drawString(58, y - 28, "SENTENCE STARTER")
    pdf.setFillColor(INK)
    pdf.setFont("DeckSans", 9)
    pdf.drawString(58, y - 45, "I think Maya should ______ because ______.")
    pdf.showPage()

    # Page 2
    header(pdf, 2)
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 21)
    pdf.drawString(44, HEIGHT - 139, "Build a reasoned response")
    pdf.setFillColor(MUTED)
    pdf.setFont("DeckSans", 9.2)
    pdf.drawString(44, HEIGHT - 160, "There is no single answer to copy. Make your own claim and support it.")
    y = HEIGHT - 204
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 12)
    pdf.drawString(44, y, "3  JUSTIFY")
    y = paragraph(pdf, "State your view, give one detail from the situation, and explain how that detail supports your view.", 44, y - 22, WIDTH - 88, size=9.8, leading=15)
    ruled_lines(pdf, 44, y - 3, WIDTH - 88, 4, 24)
    y -= 112
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 12)
    pdf.drawString(44, y, "4  REFLECT")
    y = paragraph(pdf, "What new information could change your decision? Where else might the same kind of reasoning help?", 44, y - 22, WIDTH - 88, size=9.8, leading=15)
    ruled_lines(pdf, 44, y - 3, WIDTH - 88, 4, 24)
    y -= 112
    box(pdf, 44, y - 70, WIDTH - 88, 58, GREEN, radius=10)
    pdf.setFillColor(NAVY)
    pdf.setFont("DeckSans-Bold", 9)
    pdf.drawString(58, y - 34, "THE THINKING CYCLE")
    pdf.setFillColor(INK)
    pdf.setFont("DeckSans-Bold", 9.5)
    pdf.drawString(58, y - 53, "Analyze  →  Evaluate  →  Justify  →  Reflect")
    y -= 98
    pdf.setFillColor(MUTED)
    pdf.setFont("DeckSans-Bold", 8.5)
    pdf.drawString(44, y, "PARENT / TEACHER PROMPT")
    paragraph(
        pdf,
        "Ask “What makes you think that?” before correcting grammar. Invite the learner to add evidence, then explain the connection.",
        44, y - 17, WIDTH - 88, size=8.6, leading=13, color=MUTED,
    )
    pdf.save()


if __name__ == "__main__":
    build()
