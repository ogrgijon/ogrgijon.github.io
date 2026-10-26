from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "cv"
PAPER = colors.HexColor("#f3f0e8")
INK = colors.HexColor("#20231f")
MUTED = colors.HexColor("#686b62")
LINE = colors.HexColor("#d8d5ca")
LIME = colors.HexColor("#d8f36a")
ORANGE = colors.HexColor("#e46b43")
PAGE_W, PAGE_H = A4
MARGIN = 17 * mm


def register_fonts():
    candidates = [
        (r"C:\Windows\Fonts\Manrope-Regular.ttf", "Manrope"),
        (r"C:\Windows\Fonts\Manrope-Bold.ttf", "Manrope-Bold"),
        (r"C:\Windows\Fonts\DMMono-Regular.ttf", "DMMono"),
    ]
    for filename, name in candidates:
        if Path(filename).exists():
            pdfmetrics.registerFont(TTFont(name, filename))


def paragraph(c, text, x, top, width, style, max_height=100 * mm):
    item = Paragraph(text, style)
    _, height = item.wrap(width, max_height)
    item.drawOn(c, x, top - height)
    return top - height


def build_pdf(filename, person, role, headline, summary, skills, highlights, education, contact):
    path = OUT / filename
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setTitle(f"Currículum · {person}")
    c.setAuthor(person)
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    regular = "Manrope" if "Manrope" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
    bold = "Manrope-Bold" if "Manrope-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
    mono = "DMMono" if "DMMono" in pdfmetrics.getRegisteredFontNames() else "Courier"
    body = ParagraphStyle("body", fontName=regular, fontSize=8.4, leading=11.4, textColor=MUTED, alignment=TA_LEFT)
    small = ParagraphStyle("small", fontName=regular, fontSize=7.5, leading=10, textColor=MUTED)
    heading = ParagraphStyle("heading", fontName=bold, fontSize=10.2, leading=12, textColor=INK)
    x = MARGIN
    right = PAGE_W - MARGIN
    width = right - x

    c.setFillColor(INK)
    c.rect(0, PAGE_H - 7 * mm, PAGE_W, 7 * mm, fill=1, stroke=0)
    c.setFillColor(ORANGE)
    c.rect(x, PAGE_H - 16 * mm, 20 * mm, 1.1 * mm, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont(mono, 7)
    c.drawString(x, PAGE_H - 24 * mm, "PERFIL PROFESIONAL  /  CURRÍCULUM")
    c.drawRightString(right, PAGE_H - 24 * mm, role.upper())

    c.setFillColor(INK)
    c.setFont(bold, 32)
    c.drawString(x, PAGE_H - 40 * mm, person)
    c.setFillColor(ORANGE)
    c.setFont("Helvetica", 15)
    c.drawString(x, PAGE_H - 49 * mm, headline)
    paragraph(c, summary, x, PAGE_H - 56 * mm, width, body, 24 * mm)

    y = PAGE_H - 82 * mm
    c.setStrokeColor(LINE)
    c.line(x, y, right, y)
    y -= 7 * mm
    col_gap = 10 * mm
    left_w = 62 * mm
    right_x = x + left_w + col_gap
    right_w = right - right_x

    def section_label(label, xx, yy):
        c.setFillColor(ORANGE)
        c.setFont(mono, 7)
        c.drawString(xx, yy, label.upper())
        return yy - 6 * mm

    left_y = section_label("Áreas de especialidad", x, y)
    for title, detail in skills:
        left_y = paragraph(c, f"<b>{title}</b><br/>{detail}", x, left_y, left_w, small, 35 * mm) - 4 * mm

    left_y -= 2 * mm
    left_y = section_label("Formación", x, left_y)
    for item in education:
        left_y = paragraph(c, item, x, left_y, left_w, small, 20 * mm) - 4 * mm

    right_y = section_label("Experiencia y proyectos destacados", right_x, y)
    for title, period, detail in highlights:
        c.setFillColor(INK)
        c.setFont(bold, 9)
        c.drawString(right_x, right_y, title)
        c.setFillColor(ORANGE)
        c.setFont(mono, 6.5)
        c.drawRightString(right, right_y, period)
        right_y -= 3 * mm
        right_y = paragraph(c, detail, right_x, right_y, right_w, small, 30 * mm) - 4 * mm

    footer_y = 23 * mm
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, footer_y, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont(mono, 7)
    c.drawString(x, 15 * mm, "CONTACTO")
    c.setFillColor(PAPER)
    c.setFont(regular, 8)
    c.drawString(x + 23 * mm, 15 * mm, contact)
    c.setFillColor(MUTED)
    c.setFont(mono, 6.5)
    c.drawRightString(right, 7 * mm, "TECNOLOGÍA CON PROPÓSITO  ·  IDEAS EN MOVIMIENTO")
    c.showPage()
    c.save()


register_fonts()
OUT.mkdir(parents=True, exist_ok=True)

build_pdf(
    "oscar-gijon-resume.pdf",
    "Óscar Gijón",
    "Desarrollo · Innovación · Diseño",
    "Conectar ideas. Crear impacto.",
    "Desarrollador e innovador tecnológico. Combino software, datos y diseño digital para convertir necesidades complejas en soluciones útiles, desde la comprensión del reto hasta la puesta en marcha.",
    [
        ("Desarrollo digital", "PHP, Python, JavaScript, TypeScript, Angular, HTML y CSS."),
        ("Datos e innovación", "SQL, PostgreSQL, cuadros de mando, gobierno del dato y digitalización."),
        ("IoT y sistemas", "ESP32, C++, Linux, Docker, prototipado y telecontrol."),
        ("Producto y diseño", "UI/UX, MVP, diseño visual, WordPress y Odoo."),
    ],
    [
        ("Gobierno del dato · Sector público", "2023—25", "Consultoría, cuadros de mando, trazabilidad y planes de digitalización."),
        ("Producto digital · Editorial", "2022", "Diseño y desarrollo de un MVP para campus virtuales Moodle europeos."),
        ("Datos para salud e investigación", "2021", "Sistemas de recogida y visualización para análisis y optimización de recursos."),
        ("Conectividad rural · Oxon3", "2018—20", "Herramientas de gestión para ampliar la conectividad en zonas rurales de Asturias."),
        ("Prototipos IoT · TácticaTIC", "2017—18", "Software y hardware para monitorización, eficiencia energética y telecontrol."),
        ("Desarrollo de Aplicaciones Web", "2014—16", "Formación técnica aplicada a software, servicios web y proyectos digitales."),
    ],
    [
        "Técnico Superior en Desarrollo de Aplicaciones Web",
        "Experiencia transversal en desarrollo, datos, digitalización, diseño y sistemas conectados.",
    ],
    "ogrgijon.es  ·  es.linkedin.com/in/ogrgijon  ·  info@ogrgijon.es",
)

build_pdf(
    "penelope-blanco-resume.pdf",
    "Penélope Blanco",
    "Ingeniería · Ciencia · Educación",
    "Conectar disciplinas. Crear comprensión.",
    "Ingeniera química y mecánica industrial, profesora de matemáticas y técnica superior de laboratorio. Una trayectoria que conecta análisis de procesos, experimentación y enseñanza para comprender problemas y compartir conocimiento.",
    [
        ("Ingeniería industrial", "Análisis de sistemas, mecánica, procesos y resolución de retos técnicos."),
        ("Ciencia y laboratorio", "Método experimental, observación rigurosa, química e interpretación de resultados."),
        ("Educación y divulgación", "Matemáticas, didáctica y comunicación clara adaptada al aprendizaje."),
        ("Procesos y mejora", "Organización industrial, calidad y mejora continua · Six Sigma."),
    ],
    [
        ("Docencia de matemáticas", "ACTUAL", "Enseñanza desde la comprensión y la aplicación, con acompañamiento y comunicación cercana."),
        ("Ingeniería mecánica industrial", "FORMACIÓN", "Análisis y resolución de problemas aplicados a sistemas mecánicos y procesos."),
        ("Ingeniería química industrial", "FORMACIÓN", "Procesos químicos industriales que conectan ciencia, matemáticas y aplicaciones técnicas."),
        ("Técnica Superior de Laboratorio", "FORMACIÓN", "Procedimientos, análisis y trabajo experimental con atención al rigor y la observación."),
        ("Organización industrial · Six Sigma", "FORMACIÓN", "Mejora de procesos, calidad y toma de decisiones basada en el análisis."),
    ],
    [
        "Máster de Profesorado",
        "Ingeniería Mecánica Industrial",
        "Ingeniería Química Industrial",
        "Técnica Superior de Laboratorio",
        "Formación en organización industrial y Six Sigma",
    ],
    "linkedin.com/in/penelopeblancoacedo",
)
