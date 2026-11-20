import { DesignConfig, PythonModule } from '../types/studio';
import { PALETTES, TEMPLATES } from './palettes';

function getFontSizes(scale: DesignConfig['fontScale']) {
  if (scale === 'accessible') {
    return { title: 26, section: 18, body: 15, caption: 13, button: 15 };
  }
  return { title: 22, section: 16, body: 14, caption: 12, button: 14 };
}

function generateThemePy(config: DesignConfig): string {
  const palette = PALETTES[config.accentId];
  const fonts = getFontSizes(config.fontScale);
  const outerPad = config.cardPadding + 8;
  const cardGap = Math.max(14, Math.round(config.cardPadding * 0.75));

  return `"""
theme.py — Centralized visual design tokens.

Keeping colors, spacing, and font sizes in one place makes the app easy to
maintain and ensures every screen feels calm, spacious, and consistent.
Notice how CustomTkinter uses (light_color, dark_color) tuples so your UI
automatically adapts if the user switches between Light and Dark mode.
"""

# Appearance: "Light", "Dark", or "System"
APPEARANCE_MODE = "${config.appearanceMode === 'dark' ? 'Dark' : 'Light'}"

COLORS = {
    # 60% Neutral Canvas (main window background)
    "canvas": ("${palette.light.canvas}", "${palette.dark.canvas}"),
    # 30% Structural Card Surfaces (elevated, breathable content containers)
    "card": ("${palette.light.card}", "${palette.dark.card}"),
    "card_border": ("${palette.light.cardBorder}", "${palette.dark.cardBorder}"),
    "subtle_surface": ("${palette.light.subtleSurface}", "${palette.dark.subtleSurface}"),
    # High-contrast readable text (never pure harsh black/white glare)
    "text_primary": ("${palette.light.textPrimary}", "${palette.dark.textPrimary}"),
    "text_secondary": ("${palette.light.textSecondary}", "${palette.dark.textSecondary}"),
    # Inputs
    "input_bg": ("${palette.light.inputBg}", "${palette.dark.inputBg}"),
    "input_border": ("${palette.light.inputBorder}", "${palette.dark.inputBorder}"),
    # 10% Accent Budget (strictly reserved for primary actions & active states)
    "accent": ("${palette.accent}", "${palette.accent}"),
    "accent_hover": ("${palette.accentHover}", "${palette.accentHover}"),
    "accent_soft": ("${palette.accentSoftLight}", "${palette.accentSoftDark}"),
}

SPACING = {
    # Outer window margin keeps widgets away from window edges
    "window_margin": ${outerPad},
    # Generous inner padding inside every card prevents cramped interfaces
    "card_pad_x": ${config.cardPadding},
    "card_pad_y": ${Math.round(config.cardPadding * 0.85)},
    # Vertical gap between sibling cards
    "card_gap": ${cardGap},
    # Smooth rounded corners replace sharp 1990s Tkinter rectangles
    "corner_radius": ${config.cornerRadius},
    "button_radius": ${Math.max(8, config.cornerRadius - 4)},
}

FONTS = {
    "family": "Segoe UI",  # Clean, legible system sans (SF Pro on macOS, Inter/Ubuntu on Linux)
    "title_size": ${fonts.title},
    "section_size": ${fonts.section},
    "body_size": ${fonts.body},
    "caption_size": ${fonts.caption},
    "button_size": ${fonts.button},
}
`;
}

function generateComponentsPy(): string {
  return `"""
components.py — Reusable, modular CustomTkinter building blocks.

Instead of repeating styling options on every single widget, we wrap common
patterns (cards, section headings, primary buttons) into small classes.
Anyone reading the main window code can understand the layout at a glance.
"""

import customtkinter as ctk
from theme import COLORS, SPACING, FONTS


class CardFrame(ctk.CTkFrame):
    """
    A clean, spacious container card with a subtle 1px border and generous
    internal padding. Use this to group related controls without visual clutter.
    """

    def __init__(self, master, **kwargs):
        super().__init__(
            master,
            fg_color=COLORS["card"],
            border_color=COLORS["card_border"],
            border_width=1,
            corner_radius=SPACING["corner_radius"],
            **kwargs,
        )
        # Allow child widgets inside the card to expand cleanly across its width
        self.grid_columnconfigure(0, weight=1)


class SectionHeader(ctk.CTkFrame):
    """
    Creates clear visual hierarchy: a bold section title paired with an
    optional calm, helpful subtitle underneath.
    """

    def __init__(self, master, title: str, subtitle: str = "", **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.grid_columnconfigure(0, weight=1)

        self.title_label = ctk.CTkLabel(
            self,
            text=title,
            font=ctk.CTkFont(
                family=FONTS["family"],
                size=FONTS["section_size"],
                weight="bold",
            ),
            text_color=COLORS["text_primary"],
            anchor="w",
        )
        self.title_label.grid(row=0, column=0, sticky="w")

        if subtitle:
            self.subtitle_label = ctk.CTkLabel(
                self,
                text=subtitle,
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["caption_size"]),
                text_color=COLORS["text_secondary"],
                anchor="w",
                wraplength=540,
                justify="left",
            )
            self.subtitle_label.grid(row=1, column=0, sticky="w", pady=(4, 0))


class PrimaryButton(ctk.CTkButton):
    """
    High-intent action button with comfortable 40px+ touch/click height
    and smooth rounded corners.
    """

    def __init__(self, master, text: str, command=None, **kwargs):
        super().__init__(
            master,
            text=text,
            command=command,
            height=42,
            corner_radius=SPACING["button_radius"],
            fg_color=COLORS["accent"],
            hover_color=COLORS["accent_hover"],
            text_color="#FFFFFF",
            font=ctk.CTkFont(
                family=FONTS["family"],
                size=FONTS["button_size"],
                weight="bold",
            ),
            **kwargs,
        )


class SecondaryButton(ctk.CTkButton):
    """
    Quiet supporting button that avoids competing with the primary CTA.
    """

    def __init__(self, master, text: str, command=None, **kwargs):
        super().__init__(
            master,
            text=text,
            command=command,
            height=42,
            corner_radius=SPACING["button_radius"],
            fg_color=COLORS["subtle_surface"],
            hover_color=COLORS["card_border"],
            border_color=COLORS["card_border"],
            border_width=1,
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["button_size"]),
            **kwargs,
        )
`;
}

function generateFocusBreathAppWindow(): string {
  return `"""
app_window.py — Stillpoint: Empathetic Focus & Breath Companion.

Layout structure:
  Row 0: Gentle top header with greeting and appearance-safe framing
  Row 1: Main 2-column workspace (left: focus timer card, right: energy check-in)
  Row 2: Bottom intention note card with encouraging feedback
"""

import customtkinter as ctk
from theme import COLORS, SPACING, FONTS
from components import CardFrame, SectionHeader, PrimaryButton, SecondaryButton


ENERGY_MESSAGES = {
    "Calm": "You feel grounded. A steady 25-minute block will flow naturally.",
    "Steady": "Take one clear priority at a time. Small progress is real progress.",
    "Stretched": "Be gentle with yourself today. Try a lighter 15-minute pace and hydrate.",
}


class FocusCompanionApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # 1. Window basics: generous minimum size prevents cramped resizing
        self.title("Stillpoint — Focus Companion")
        self.geometry("880x640")
        self.minsize(780, 560)
        self.configure(fg_color=COLORS["canvas"])

        # 2. Application state
        self.total_seconds = 25 * 60
        self.remaining_seconds = self.total_seconds
        self.is_running = False
        self._timer_job = None

        # 3. Build modular layout
        self._configure_grid()
        self._build_header()
        self._build_main_cards()
        self._build_intention_card()

    def _configure_grid(self):
        """Give the root window clean responsive margins and column balance."""
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

    def _build_header(self):
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["window_margin"],
            pady=(SPACING["window_margin"], SPACING["card_gap"]),
        )
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header,
            text="Good afternoon, take things one breath at a time",
            font=ctk.CTkFont(
                family=FONTS["family"],
                size=FONTS["title_size"],
                weight="bold",
            ),
            text_color=COLORS["text_primary"],
            anchor="w",
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(
            header,
            text="A calm desktop space designed for unhurried focus without harsh alarms.",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
            text_color=COLORS["text_secondary"],
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))

    def _build_main_cards(self):
        """Two balanced cards side-by-side with clear whitespace separation."""
        container = ctk.CTkFrame(self, fg_color="transparent")
        container.grid(
            row=1,
            column=0,
            sticky="nsew",
            padx=SPACING["window_margin"],
            pady=(0, SPACING["card_gap"]),
        )
        container.grid_columnconfigure(0, weight=3)
        container.grid_columnconfigure(1, weight=2)
        container.grid_rowconfigure(0, weight=1)

        # --- Left Card: Focus Timer ---
        timer_card = CardFrame(container)
        timer_card.grid(row=0, column=0, sticky="nsew", padx=(0, SPACING["card_gap"] // 2))

        SectionHeader(
            timer_card,
            title="Current Focus Block",
            subtitle="Pause or step away whenever you need to.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.timer_display = ctk.CTkLabel(
            timer_card,
            text="25:00",
            font=ctk.CTkFont(family=FONTS["family"], size=52, weight="bold"),
            text_color=COLORS["text_primary"],
        )
        self.timer_display.grid(row=1, column=0, pady=(12, 8))

        self.progress_bar = ctk.CTkProgressBar(
            timer_card,
            height=10,
            corner_radius=5,
            fg_color=COLORS["subtle_surface"],
            progress_color=COLORS["accent"],
        )
        self.progress_bar.set(1.0)
        self.progress_bar.grid(
            row=2,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(8, 24),
        )

        # Action row inside timer card
        controls = ctk.CTkFrame(timer_card, fg_color="transparent")
        controls.grid(
            row=3,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(0, SPACING["card_pad_y"]),
        )
        controls.grid_columnconfigure((0, 1), weight=1)

        self.toggle_btn = PrimaryButton(
            controls,
            text="Start Session",
            command=self.toggle_timer,
        )
        self.toggle_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        SecondaryButton(
            controls,
            text="Reset",
            command=self.reset_timer,
        ).grid(row=0, column=1, sticky="ew", padx=(8, 0))

        # --- Right Card: Empathetic Energy Check-In ---
        energy_card = CardFrame(container)
        energy_card.grid(row=0, column=1, sticky="nsew", padx=(SPACING["card_gap"] // 2, 0))

        SectionHeader(
            energy_card,
            title="How is your energy?",
            subtitle="Adjusts your session tone without judgment.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.energy_selector = ctk.CTkSegmentedButton(
            energy_card,
            values=["Calm", "Steady", "Stretched"],
            command=self.on_energy_change,
            height=38,
            selected_color=COLORS["accent"],
            selected_hover_color=COLORS["accent_hover"],
        )
        self.energy_selector.set("Steady")
        self.energy_selector.grid(
            row=1,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(0, 16),
        )

        self.energy_note = ctk.CTkLabel(
            energy_card,
            text=ENERGY_MESSAGES["Steady"],
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
            text_color=COLORS["text_secondary"],
            wraplength=260,
            justify="left",
            anchor="nw",
        )
        self.energy_note.grid(
            row=2,
            column=0,
            sticky="nsew",
            padx=SPACING["card_pad_x"],
            pady=(0, SPACING["card_pad_y"]),
        )

    def _build_intention_card(self):
        """Bottom card for writing a single gentle intention."""
        note_card = CardFrame(self)
        note_card.grid(
            row=2,
            column=0,
            sticky="ew",
            padx=SPACING["window_margin"],
            pady=(0, SPACING["window_margin"]),
        )
        note_card.grid_columnconfigure(0, weight=1)

        SectionHeader(
            note_card,
            title="One gentle intention",
            subtitle="What single task would feel satisfying to finish right now?",
        ).grid(
            row=0,
            column=0,
            columnspan=2,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 12),
        )

        self.intention_entry = ctk.CTkEntry(
            note_card,
            height=42,
            corner_radius=SPACING["button_radius"],
            fg_color=COLORS["input_bg"],
            border_color=COLORS["input_border"],
            placeholder_text="e.g., Outline the first two sections of my report...",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
        )
        self.intention_entry.grid(
            row=1,
            column=0,
            sticky="ew",
            padx=(SPACING["card_pad_x"], 12),
            pady=(0, SPACING["card_pad_y"]),
        )

        self.save_status_btn = SecondaryButton(
            note_card,
            text="Set Intention",
            width=140,
            command=self.save_intention,
        )
        self.save_status_btn.grid(
            row=1,
            column=1,
            padx=(0, SPACING["card_pad_x"]),
            pady=(0, SPACING["card_pad_y"]),
        )

    def toggle_timer(self):
        self.is_running = not self.is_running
        if self.is_running:
            self.toggle_btn.configure(text="Pause Session")
            self._tick()
        else:
            self.toggle_btn.configure(text="Resume Session")
            if self._timer_job:
                self.after_cancel(self._timer_job)

    def _tick(self):
        if self.is_running and self.remaining_seconds > 0:
            self.remaining_seconds -= 1
            self._update_timer_ui()
            self._timer_job = self.after(1000, self._tick)
        elif self.remaining_seconds == 0:
            self.is_running = False
            self.toggle_btn.configure(text="Session Complete")

    def reset_timer(self):
        self.is_running = False
        if self._timer_job:
            self.after_cancel(self._timer_job)
        self.remaining_seconds = self.total_seconds
        self.toggle_btn.configure(text="Start Session")
        self._update_timer_ui()

    def _update_timer_ui(self):
        mins, secs = divmod(self.remaining_seconds, 60)
        self.timer_display.configure(text=f"{mins:02d}:{secs:02d}")
        self.progress_bar.set(self.remaining_seconds / self.total_seconds)

    def on_energy_change(self, choice: str):
        self.energy_note.configure(text=ENERGY_MESSAGES.get(choice, ""))
        # Offer a softer 15-minute block automatically when feeling stretched
        if choice == "Stretched" and not self.is_running:
            self.total_seconds = 15 * 60
            self.remaining_seconds = self.total_seconds
            self._update_timer_ui()
        elif choice in ("Calm", "Steady") and not self.is_running:
            self.total_seconds = 25 * 60
            self.remaining_seconds = self.total_seconds
            self._update_timer_ui()

    def save_intention(self):
        text = self.intention_entry.get().strip()
        if text:
            self.save_status_btn.configure(text="Saved!")
            self.after(1800, lambda: self.save_status_btn.configure(text="Set Intention"))
`;
}

function generateCareLogAppWindow(): string {
  return `"""
app_window.py — Kindred: Empathetic Daily Care & Wellness Log.

Designed with generous spacing, large clickable checkboxes, and supportive
progress text so tracking daily medication or hydration never feels stressful.
"""

import customtkinter as ctk
from theme import COLORS, SPACING, FONTS
from components import CardFrame, SectionHeader, PrimaryButton, SecondaryButton


CARE_TASKS = [
    ("Morning medication with breakfast", "8:00 AM"),
    ("Short 10-minute stretch or walk", "10:30 AM"),
    ("Afternoon check-in & quiet screen break", "2:00 PM"),
    ("Evening wind-down & prep for tomorrow", "8:30 PM"),
]


class DailyCareApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Kindred — Daily Care Check-In")
        self.geometry("900x660")
        self.minsize(800, 580)
        self.configure(fg_color=COLORS["canvas"])

        self.water_glasses = 3
        self.water_goal = 8
        self.check_vars = []

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self._build_header()
        self._build_workspace()

    def _build_header(self):
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["window_margin"],
            pady=(SPACING["window_margin"], SPACING["card_gap"]),
        )
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header,
            text="Daily Care Check-In",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["title_size"], weight="bold"),
            text_color=COLORS["text_primary"],
            anchor="w",
        ).grid(row=0, column=0, sticky="w")

        self.summary_label = ctk.CTkLabel(
            header,
            text="Every small step you check off helps your future self.",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
            text_color=COLORS["text_secondary"],
            anchor="w",
        )
        self.summary_label.grid(row=1, column=0, sticky="w", pady=(4, 0))

    def _build_workspace(self):
        grid = ctk.CTkFrame(self, fg_color="transparent")
        grid.grid(
            row=1,
            column=0,
            sticky="nsew",
            padx=SPACING["window_margin"],
            pady=(0, SPACING["window_margin"]),
        )
        grid.grid_columnconfigure(0, weight=3)
        grid.grid_columnconfigure(1, weight=2)
        grid.grid_rowconfigure(0, weight=1)

        # --- Left Card: Routine Checklist ---
        checklist_card = CardFrame(grid)
        checklist_card.grid(row=0, column=0, sticky="nsew", padx=(0, SPACING["card_gap"] // 2))

        SectionHeader(
            checklist_card,
            title="Today's Gentle Routine",
            subtitle="Check off items at your own pace — missed items simply wait without penalty.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.progress_bar = ctk.CTkProgressBar(
            checklist_card,
            height=10,
            corner_radius=5,
            fg_color=COLORS["subtle_surface"],
            progress_color=COLORS["accent"],
        )
        self.progress_bar.set(0.25)
        self.progress_bar.grid(
            row=1,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(0, 20),
        )

        list_frame = ctk.CTkFrame(checklist_card, fg_color="transparent")
        list_frame.grid(
            row=2,
            column=0,
            sticky="nsew",
            padx=SPACING["card_pad_x"],
            pady=(0, SPACING["card_pad_y"]),
        )
        list_frame.grid_columnconfigure(0, weight=1)

        for idx, (label, time_hint) in enumerate(CARE_TASKS):
            var = ctk.BooleanVar(value=(idx == 0))
            self.check_vars.append(var)

            row_box = ctk.CTkFrame(
                list_frame,
                fg_color=COLORS["subtle_surface"],
                corner_radius=SPACING["button_radius"],
            )
            row_box.grid(row=idx, column=0, sticky="ew", pady=(0, 10))
            row_box.grid_columnconfigure(0, weight=1)

            cb = ctk.CTkCheckBox(
                row_box,
                text=label,
                variable=var,
                command=self._update_progress,
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
                text_color=COLORS["text_primary"],
                fg_color=COLORS["accent"],
                hover_color=COLORS["accent_hover"],
                checkbox_width=22,
                checkbox_height=22,
            )
            cb.grid(row=0, column=0, sticky="w", padx=16, pady=14)

            ctk.CTkLabel(
                row_box,
                text=time_hint,
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["caption_size"]),
                text_color=COLORS["text_secondary"],
            ).grid(row=0, column=1, sticky="e", padx=16)

        # --- Right Card: Hydration & Quick Reflection ---
        side_card = CardFrame(grid)
        side_card.grid(row=0, column=1, sticky="nsew", padx=(SPACING["card_gap"] // 2, 0))

        SectionHeader(
            side_card,
            title="Hydration Counter",
            subtitle="Steady sips throughout the day.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.water_label = ctk.CTkLabel(
            side_card,
            text=f"{self.water_glasses} / {self.water_goal} glasses",
            font=ctk.CTkFont(family=FONTS["family"], size=28, weight="bold"),
            text_color=COLORS["text_primary"],
        )
        self.water_label.grid(row=1, column=0, pady=(8, 16))

        btn_row = ctk.CTkFrame(side_card, fg_color="transparent")
        btn_row.grid(row=2, column=0, sticky="ew", padx=SPACING["card_pad_x"], pady=(0, 24))
        btn_row.grid_columnconfigure((0, 1), weight=1)

        PrimaryButton(btn_row, text="+1 Glass", command=self.add_water).grid(
            row=0, column=0, sticky="ew", padx=(0, 6)
        )
        SecondaryButton(btn_row, text="Reset", command=self.reset_water).grid(
            row=0, column=1, sticky="ew", padx=(6, 0)
        )

        SectionHeader(
            side_card,
            title="How are you feeling?",
            subtitle="Optional private note for your log.",
        ).grid(
            row=3,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(8, 10),
        )

        self.note_box = ctk.CTkTextbox(
            side_card,
            height=110,
            corner_radius=SPACING["button_radius"],
            fg_color=COLORS["input_bg"],
            border_color=COLORS["input_border"],
            border_width=1,
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
        )
        self.note_box.grid(
            row=4,
            column=0,
            sticky="nsew",
            padx=SPACING["card_pad_x"],
            pady=(0, SPACING["card_pad_y"]),
        )

    def _update_progress(self):
        completed = sum(1 for v in self.check_vars if v.get())
        total = len(self.check_vars)
        self.progress_bar.set(completed / total if total else 0)
        self.summary_label.configure(
            text=f"{completed} of {total} care moments completed today. Go at a comfortable pace."
        )

    def add_water(self):
        if self.water_glasses < 16:
            self.water_glasses += 1
            self.water_label.configure(text=f"{self.water_glasses} / {self.water_goal} glasses")

    def reset_water(self):
        self.water_glasses = 0
        self.water_label.configure(text=f"0 / {self.water_goal} glasses")
`;
}

function generateClientNotesAppWindow(): string {
  return `"""
app_window.py — Harbor: Quiet Client Session Desk.

Uses a clean master-detail card architecture:
  - Left scrollable card lists people cleanly with zero visual clutter
  - Right spacious editor card holds structured session notes and save feedback
"""

import customtkinter as ctk
from theme import COLORS, SPACING, FONTS
from components import CardFrame, SectionHeader, PrimaryButton, SecondaryButton


CLIENTS = [
    {"name": "Maya Lin", "meta": "Session 06 · Weekly Check-in", "notes": "Focused on pacing workload and setting clear evening boundaries."},
    {"name": "David Okafor", "meta": "Session 03 · Career Transition", "notes": "Reviewed portfolio drafts; next step is reaching out to two mentors."},
    {"name": "Elena Rostova", "meta": "Session 11 · Study Coaching", "notes": "Practiced breaking thesis chapters into 30-minute calm blocks."},
]


class ClientNotesApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Harbor — Session Notes")
        self.geometry("980x680")
        self.minsize(840, 600)
        self.configure(fg_color=COLORS["canvas"])

        self.active_index = 0
        self.client_buttons = []

        self.grid_columnconfigure(0, weight=2)
        self.grid_columnconfigure(1, weight=5)
        self.grid_rowconfigure(0, weight=1)

        self._build_client_sidebar()
        self._build_editor_panel()
        self._load_client(0)

    def _build_client_sidebar(self):
        sidebar_card = CardFrame(self)
        sidebar_card.grid(
            row=0,
            column=0,
            sticky="nsew",
            padx=(SPACING["window_margin"], SPACING["card_gap"] // 2),
            pady=SPACING["window_margin"],
        )
        sidebar_card.grid_rowconfigure(1, weight=1)

        SectionHeader(
            sidebar_card,
            title="Active Roster",
            subtitle="Select a person to open their notes.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 14),
        )

        scroll_list = ctk.CTkScrollableFrame(
            sidebar_card,
            fg_color="transparent",
        )
        scroll_list.grid(
            row=1,
            column=0,
            sticky="nsew",
            padx=SPACING["card_pad_x"] - 6,
            pady=(0, SPACING["card_pad_y"]),
        )
        scroll_list.grid_columnconfigure(0, weight=1)

        for idx, client in enumerate(CLIENTS):
            btn = ctk.CTkButton(
                scroll_list,
                text=f"{client['name']}\\n{client['meta']}",
                anchor="w",
                height=58,
                corner_radius=SPACING["button_radius"],
                fg_color=COLORS["subtle_surface"],
                hover_color=COLORS["card_border"],
                text_color=COLORS["text_primary"],
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
                command=lambda i=idx: self._load_client(i),
            )
            btn.grid(row=idx, column=0, sticky="ew", pady=(0, 10))
            self.client_buttons.append(btn)

    def _build_editor_panel(self):
        editor_card = CardFrame(self)
        editor_card.grid(
            row=0,
            column=1,
            sticky="nsew",
            padx=(SPACING["card_gap"] // 2, SPACING["window_margin"]),
            pady=SPACING["window_margin"],
        )
        editor_card.grid_rowconfigure(2, weight=1)

        self.header_block = SectionHeader(
            editor_card,
            title="Client Name",
            subtitle="Session summary",
        )
        self.header_block.grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.followup_switch = ctk.CTkCheckBox(
            editor_card,
            text="Flag for gentle follow-up email tomorrow",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
            text_color=COLORS["text_secondary"],
            fg_color=COLORS["accent"],
        )
        self.followup_switch.grid(
            row=1,
            column=0,
            sticky="w",
            padx=SPACING["card_pad_x"],
            pady=(0, 14),
        )

        self.notes_textbox = ctk.CTkTextbox(
            editor_card,
            corner_radius=SPACING["button_radius"],
            fg_color=COLORS["input_bg"],
            border_color=COLORS["input_border"],
            border_width=1,
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
            wrap="word",
        )
        self.notes_textbox.grid(
            row=2,
            column=0,
            sticky="nsew",
            padx=SPACING["card_pad_x"],
            pady=(0, 18),
        )

        footer = ctk.CTkFrame(editor_card, fg_color="transparent")
        footer.grid(
            row=3,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(0, SPACING["card_pad_y"]),
        )
        footer.grid_columnconfigure(0, weight=1)

        self.status_label = ctk.CTkLabel(
            footer,
            text="All changes stay local on this computer.",
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["caption_size"]),
            text_color=COLORS["text_secondary"],
            anchor="w",
        )
        self.status_label.grid(row=0, column=0, sticky="w")

        SecondaryButton(footer, text="Clear Draft", width=110, command=self._clear_draft).grid(
            row=0, column=1, padx=(0, 10)
        )
        PrimaryButton(footer, text="Save Note", width=130, command=self._save_note).grid(
            row=0, column=2
        )

    def _load_client(self, idx: int):
        self.active_index = idx
        client = CLIENTS[idx]
        self.header_block.title_label.configure(text=client["name"])
        self.header_block.subtitle_label.configure(text=client["meta"])
        self.notes_textbox.delete("1.0", "end")
        self.notes_textbox.insert("1.0", client["notes"])

        for i, btn in enumerate(self.client_buttons):
            is_selected = i == idx
            btn.configure(
                fg_color=COLORS["accent_soft"] if is_selected else COLORS["subtle_surface"],
                border_color=COLORS["accent"] if is_selected else COLORS["card_border"],
                border_width=1,
            )

    def _save_note(self):
        CLIENTS[self.active_index]["notes"] = self.notes_textbox.get("1.0", "end").strip()
        self.status_label.configure(text="Saved quietly to session record.")
        self.after(2200, lambda: self.status_label.configure(text="All changes stay local on this computer."))

    def _clear_draft(self):
        self.notes_textbox.delete("1.0", "end")
`;
}

function generateCalmBudgetAppWindow(): string {
  return `"""
app_window.py — ClearLedger: Calm Monthly Budget Planner.

Replaces intimidating dense spreadsheets with plain-language envelope cards,
clear sliders, and reassuring safety buffer calculations.
"""

import customtkinter as ctk
from theme import COLORS, SPACING, FONTS
from components import CardFrame, SectionHeader, PrimaryButton


class CalmBudgetApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("ClearLedger — Monthly Plan")
        self.geometry("920x660")
        self.minsize(800, 580)
        self.configure(fg_color=COLORS["canvas"])

        self.monthly_income = 4200
        self.categories = {
            "Essentials & Home": 1950,
            "Groceries & Care": 620,
            "Personal Joy": 340,
            "Future Savings": 650,
        }
        self.value_labels = {}

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self._build_summary_card()
        self._build_envelopes_card()
        self._recalculate()

    def _build_summary_card(self):
        summary = CardFrame(self)
        summary.grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["window_margin"],
            pady=(SPACING["window_margin"], SPACING["card_gap"]),
        )
        summary.grid_columnconfigure((0, 1, 2), weight=1)

        SectionHeader(
            summary,
            title="Monthly Breathing Room",
            subtitle="Adjust sliders below to see your unallocated calm buffer update immediately.",
        ).grid(
            row=0,
            column=0,
            columnspan=3,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        self.income_lbl = self._metric_cell(summary, 0, "Monthly Take-Home", "$4,200")
        self.planned_lbl = self._metric_cell(summary, 1, "Planned Envelopes", "$3,560")
        self.buffer_lbl = self._metric_cell(summary, 2, "Unallocated Buffer", "$640", highlight=True)

    def _metric_cell(self, parent, col: int, label: str, initial: str, highlight: bool = False):
        box = ctk.CTkFrame(
            parent,
            fg_color=COLORS["accent_soft"] if highlight else COLORS["subtle_surface"],
            corner_radius=SPACING["button_radius"],
        )
        box.grid(
            row=1,
            column=col,
            sticky="ew",
            padx=(SPACING["card_pad_x"] if col == 0 else 8, SPACING["card_pad_x"] if col == 2 else 8),
            pady=(0, SPACING["card_pad_y"]),
        )

        ctk.CTkLabel(
            box,
            text=label,
            font=ctk.CTkFont(family=FONTS["family"], size=FONTS["caption_size"]),
            text_color=COLORS["text_secondary"],
            anchor="w",
        ).pack(anchor="w", padx=16, pady=(12, 2))

        val_lbl = ctk.CTkLabel(
            box,
            text=initial,
            font=ctk.CTkFont(family=FONTS["family"], size=24, weight="bold"),
            text_color=COLORS["accent"] if highlight else COLORS["text_primary"],
            anchor="w",
        )
        val_lbl.pack(anchor="w", padx=16, pady=(0, 12))
        return val_lbl

    def _build_envelopes_card(self):
        card = CardFrame(self)
        card.grid(
            row=1,
            column=0,
            sticky="nsew",
            padx=SPACING["window_margin"],
            pady=(0, SPACING["window_margin"]),
        )
        card.grid_columnconfigure(0, weight=1)

        SectionHeader(
            card,
            title="Spending Envelopes",
            subtitle="Drag any slider to rebalance your month gently.",
        ).grid(
            row=0,
            column=0,
            sticky="ew",
            padx=SPACING["card_pad_x"],
            pady=(SPACING["card_pad_y"], 16),
        )

        for idx, (name, amount) in enumerate(self.categories.items(), start=1):
            row = ctk.CTkFrame(card, fg_color="transparent")
            row.grid(
                row=idx,
                column=0,
                sticky="ew",
                padx=SPACING["card_pad_x"],
                pady=(0, 14),
            )
            row.grid_columnconfigure(0, weight=1)

            top = ctk.CTkFrame(row, fg_color="transparent")
            top.grid(row=0, column=0, sticky="ew")
            top.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(
                top,
                text=name,
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"], weight="bold"),
                text_color=COLORS["text_primary"],
            ).grid(row=0, column=0, sticky="w")

            lbl = ctk.CTkLabel(
                top,
                text=f"\${amount:,}",
                font=ctk.CTkFont(family=FONTS["family"], size=FONTS["body_size"]),
                text_color=COLORS["text_secondary"],
            )
            lbl.grid(row=0, column=1, sticky="e")
            self.value_labels[name] = lbl

            slider = ctk.CTkSlider(
                row,
                from_=0,
                to=2500,
                number_of_steps=50,
                progress_color=COLORS["accent"],
                button_color=COLORS["accent"],
                button_hover_color=COLORS["accent_hover"],
                command=lambda val, cat=name: self._on_slider(cat, val),
            )
            slider.set(amount)
            slider.grid(row=1, column=0, sticky="ew", pady=(6, 0))

        self.save_btn = PrimaryButton(card, text="Save Monthly Plan", command=self._save_plan)
        self.save_btn.grid(
            row=len(self.categories) + 1,
            column=0,
            sticky="e",
            padx=SPACING["card_pad_x"],
            pady=(8, SPACING["card_pad_y"]),
        )

    def _on_slider(self, category: str, value: float):
        rounded = int(round(value / 25.0) * 25)
        self.categories[category] = rounded
        self.value_labels[category].configure(text=f"\${rounded:,}")
        self._recalculate()

    def _recalculate(self):
        planned = sum(self.categories.values())
        buffer = self.monthly_income - planned
        self.planned_lbl.configure(text=f"\${planned:,}")
        sign = "" if buffer >= 0 else "-"
        self.buffer_lbl.configure(text=f"{sign}\${abs(buffer):,}")

    def _save_plan(self):
        self.save_btn.configure(text="Plan Saved")
        self.after(1800, lambda: self.save_btn.configure(text="Save Monthly Plan"))
`;
}

function getAppClassName(templateId: DesignConfig['templateId']): string {
  switch (templateId) {
    case 'focus-breath':
      return 'FocusCompanionApp';
    case 'care-log':
      return 'DailyCareApp';
    case 'client-notes':
      return 'ClientNotesApp';
    case 'calm-budget':
      return 'CalmBudgetApp';
  }
}

function generateMainPy(config: DesignConfig): string {
  const className = getAppClassName(config.templateId);
  return `"""
main.py — Clean application entry point.

Install dependency once:
    pip install customtkinter

Run the app:
    python main.py
"""

import customtkinter as ctk
from theme import APPEARANCE_MODE
from app_window import ${className}


def main():
    # Set appearance before creating the root window so there is zero flash
    ctk.set_appearance_mode(APPEARANCE_MODE)
    ctk.set_default_color_theme("blue")

    app = ${className}()
    app.mainloop()


if __name__ == "__main__":
    main()
`;
}

export function generatePythonModules(config: DesignConfig): PythonModule[] {
  const template = TEMPLATES.find((t) => t.id === config.templateId)!;
  const themePy = generateThemePy(config);
  const componentsPy = generateComponentsPy();
  const mainPy = generateMainPy(config);

  let appWindowPy = '';
  switch (config.templateId) {
    case 'focus-breath':
      appWindowPy = generateFocusBreathAppWindow();
      break;
    case 'care-log':
      appWindowPy = generateCareLogAppWindow();
      break;
    case 'client-notes':
      appWindowPy = generateClientNotesAppWindow();
      break;
    case 'calm-budget':
      appWindowPy = generateCalmBudgetAppWindow();
      break;
  }

  // Strip local imports for the convenient single-file runnable version
  const cleanComponents = componentsPy.replace('from theme import COLORS, SPACING, FONTS\n', '');
  const cleanAppWindow = appWindowPy
    .replace('from theme import COLORS, SPACING, FONTS\n', '')
    .replace('from components import CardFrame, SectionHeader, PrimaryButton, SecondaryButton\n', '')
    .replace('from components import CardFrame, SectionHeader, PrimaryButton\n', '');
  const className = getAppClassName(config.templateId);

  const singleFilePy = `"""
${template.id.replace('-', '_')}_app.py — Complete single-file CustomTkinter application.
Window: ${template.windowTitle} (${template.windowSize})

Quick Start:
    pip install customtkinter
    python ${template.id.replace('-', '_')}_app.py
"""

import customtkinter as ctk

# ==============================================================================
# 1. DESIGN TOKENS (Colors, Spacing, Typography)
# ==============================================================================
${themePy.replace(/^"""[\s\S]*?"""\n+/, '')}

# ==============================================================================
# 2. REUSABLE MODULAR UI COMPONENTS
# ==============================================================================
${cleanComponents.replace(/^"""[\s\S]*?"""\n+import customtkinter as ctk\n+/, '')}

# ==============================================================================
# 3. MAIN APPLICATION WINDOW
# ==============================================================================
${cleanAppWindow.replace(/^"""[\s\S]*?"""\n+import customtkinter as ctk\n+/, '')}

# ==============================================================================
# 4. ENTRY POINT
# ==============================================================================
if __name__ == "__main__":
    ctk.set_appearance_mode(APPEARANCE_MODE)
    ctk.set_default_color_theme("blue")
    app = ${className}()
    app.mainloop()
`;

  return [
    {
      filename: 'app_window.py',
      role: 'Main Window Layout',
      summary: `Builds ${template.windowTitle} using CardFrame containers, responsive grid weights, and empathetic copy.`,
      code: appWindowPy,
    },
    {
      filename: 'components.py',
      role: 'Reusable Cards & Buttons',
      summary: 'Wraps CTkFrame and CTkButton into self-documenting classes so your layout code stays readable.',
      code: componentsPy,
    },
    {
      filename: 'theme.py',
      role: 'Color, Spacing & Font Tokens',
      summary: 'Centralizes Light/Dark color pairs, generous card padding, corner radius, and accessible font sizes.',
      code: themePy,
    },
    {
      filename: 'main.py',
      role: 'Entry Point',
      summary: 'Configures CustomTkinter appearance mode and starts the desktop event loop.',
      code: mainPy,
    },
    {
      filename: `${template.id.replace('-', '_')}_app.py`,
      role: 'Single-File Runnable Script',
      summary: 'All four modules combined in order so you can download and run immediately with one command.',
      code: singleFilePy,
    },
  ];
}
