# ==============================================================================
# Mind and Mood Check In with Olie (DASS-21) — Desktop Application
# ==============================================================================
# Required packages — install once before running:
#     pip install customtkinter pandas openpyxl
#
# Run the application:
#     python dass21_app.py
# ==============================================================================

from datetime import datetime
from pathlib import Path
import customtkinter as ctk
import pandas as pd


COLORS = {
    "bg": "#F3F1EC",
    "card": "#FFFFFF",
    "stage": "#ECEBE6",
    "border": "#E4E1D9",
    "purple": "#7F62FF",
    "purple_hover": "#6E50F2",
    "indigo": "#2B0B78",
    "sunny": "#F8F054",
    "pink": "#FFD6E0",
    "sky": "#BCE3FF",
    "lime": "#B8F23B",
    "lime_hover": "#A9E42A",
    "text_primary": "#1E2028",
    "text_muted": "#4A4E5A",
}

EXCEL_FILE = Path("dass21_questions.xlsx")

DEFAULT_QUESTIONS = [
    (1, "S", "I found it hard to wind down."),
    (2, "A", "I was aware of dryness of my mouth."),
    (3, "D", "I couldn't seem to experience any positive feeling at all."),
    (
        4,
        "A",
        "I experienced breathing difficulty (e.g., excessively rapid breathing, "
        "breathlessness in the absence of physical exertion).",
    ),
    (5, "D", "I found it difficult to work up the initiative to do things."),
    (6, "S", "I tended to overreact to situations."),
    (7, "A", "I experienced trembling (e.g., in the hands)."),
    (8, "S", "I felt that I was using a lot of nervous energy."),
    (
        9,
        "A",
        "I was worried about situations in which I might panic and make a fool of myself.",
    ),
    (10, "D", "I felt that I had nothing to look forward to."),
    (11, "S", "I found myself getting agitated."),
    (12, "S", "I found it difficult to relax."),
    (13, "D", "I felt downhearted and blue."),
    (
        14,
        "S",
        "I was intolerant of anything that kept me from getting on with what I was doing.",
    ),
    (15, "A", "I felt I was close to panic."),
    (16, "D", "I was unable to become enthusiastic about anything."),
    (17, "D", "I felt I wasn't worth much as a person."),
    (18, "S", "I felt that I was rather touchy."),
    (
        19,
        "A",
        "I was aware of the action of my heart in the absence of physical exertion "
        "(e.g., sense of heart rate increase, heart missing a beat).",
    ),
    (20, "A", "I felt scared without any good reason."),
    (21, "D", "I felt that life was meaningless."),
]

RESPONSE_SCALE = [
    (0, "Not at all"),
    (1, "A little bit"),
    (2, "Quite a bit"),
    (3, "Almost always"),
]

FRIENDLY_NAMES = {
    "D": "Low Mood",
    "A": "Worry & Nerves",
    "S": "Daily Tension",
}

CLINICAL_NAMES = {
    "D": "Depression",
    "A": "Anxiety",
    "S": "Stress",
}

SUPPORT_NOTE = (
    "This check in is a personal reflection tool, not a medical diagnosis. "
    "If your week has felt heavy or overwhelming, talking with a doctor, "
    "counselor, or someone you trust can be a helpful next step."
)


def ensure_questions_excel(filepath: Path = EXCEL_FILE) -> None:
    if filepath.exists():
        return
    df = pd.DataFrame(DEFAULT_QUESTIONS, columns=["No.", "level", "Statement"])
    df.to_excel(filepath, index=False, engine="openpyxl")


def load_questions_from_excel(filepath: Path = EXCEL_FILE) -> list[dict]:
    ensure_questions_excel(filepath)
    df = pd.read_excel(filepath, engine="openpyxl")
    df = df.sort_values(by="No.").reset_index(drop=True)
    return [
        {
            "no": int(row["No."]),
            "level": str(row["level"]).strip().upper(),
            "statement": str(row["Statement"]).strip(),
        }
        for _, row in df.iterrows()
    ]


def classify_severity(category: str, multiplied_score: int) -> tuple[str, str]:
    if category == "D":
        if multiplied_score <= 9:
            return "Normal", "Feeling Steady"
        if multiplied_score <= 13:
            return "Mild", "Light Strain"
        if multiplied_score <= 20:
            return "Moderate", "Noticeable Strain"
        if multiplied_score <= 27:
            return "Severe", "Heavy Strain"
        return "Extremely Severe", "Needs Extra Care"

    if category == "A":
        if multiplied_score <= 7:
            return "Normal", "Feeling Steady"
        if multiplied_score <= 9:
            return "Mild", "Light Strain"
        if multiplied_score <= 14:
            return "Moderate", "Noticeable Strain"
        if multiplied_score <= 19:
            return "Severe", "Heavy Strain"
        return "Extremely Severe", "Needs Extra Care"

    if multiplied_score <= 14:
        return "Normal", "Feeling Steady"
    if multiplied_score <= 18:
        return "Mild", "Light Strain"
    if multiplied_score <= 25:
        return "Moderate", "Noticeable Strain"
    if multiplied_score <= 33:
        return "Severe", "Heavy Strain"
    return "Extremely Severe", "Needs Extra Care"


class DASS21App(ctk.CTk):
    def __init__(self):
        super().__init__()

        ctk.set_appearance_mode("Light")
        self.title("Mind and Mood Check In with Olie")
        self.geometry("920x660")
        self.minsize(860, 620)
        self.configure(fg_color=COLORS["bg"])
        self._center_window(920, 660)

        self.questions = load_questions_from_excel()
        self.total_questions = len(self.questions)

        self.participant_name = ""
        self.participant_age = ""
        self.sound_preference = "Calm Rain"
        self.sound_volume = 55
        self.sound_muted = False
        self.current_index = 0
        self.answers: dict[int, int] = {}
        self.option_rows: list[tuple[ctk.CTkFrame, ctk.CTkLabel]] = []

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.stage = ctk.CTkFrame(self, fg_color="transparent")
        self.stage.grid(row=0, column=0, sticky="nsew", padx=44, pady=28)
        self.stage.grid_columnconfigure(0, weight=1)
        self.stage.grid_rowconfigure(0, weight=1)

        self.show_profile_screen()

    def _center_window(self, width: int, height: int) -> None:
        self.update_idletasks()
        x = max(0, (self.winfo_screenwidth() - width) // 2)
        y = max(0, (self.winfo_screenheight() - height) // 2)
        self.geometry(f"{width}x{height}+{x}+{y}")

    def _clear_stage(self) -> None:
        for widget in self.stage.winfo_children():
            widget.destroy()

    def open_breather_popup(self) -> None:
        popup = ctk.CTkToplevel(self)
        popup.title("Take a Quiet Breath")
        popup.geometry("420x360")
        popup.configure(fg_color=COLORS["indigo"])
        popup.transient(self)
        popup.grab_set()
        popup.grid_columnconfigure(0, weight=1)

        seconds_left = [16]

        count_lbl = ctk.CTkLabel(
            popup,
            text="16",
            font=ctk.CTkFont(family="Segoe UI", size=44, weight="bold"),
            text_color="#FFFFFF",
        )
        count_lbl.grid(row=0, column=0, pady=(34, 10))

        cue_lbl = ctk.CTkLabel(
            popup,
            text="  Breathe in slowly...  ",
            fg_color="#FFFFFF",
            text_color=COLORS["text_primary"],
            corner_radius=16,
            height=34,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
        )
        cue_lbl.grid(row=1, column=0, pady=(0, 20))

        ctk.CTkLabel(
            popup,
            text="Olie is waiting right here.\nStay as long as you like.",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color="#E0DCFA",
            justify="center",
        ).grid(row=2, column=0, padx=28, pady=(0, 28))

        ctk.CTkButton(
            popup,
            text="I feel ready to continue",
            height=44,
            corner_radius=22,
            fg_color=COLORS["lime"],
            hover_color=COLORS["lime_hover"],
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            command=popup.destroy,
        ).grid(row=3, column=0, padx=36, sticky="ew")

        def tick():
            if not popup.winfo_exists():
                return
            if seconds_left[0] > 0:
                seconds_left[0] -= 1
                count_lbl.configure(text=str(seconds_left[0]))
                elapsed = 16 - seconds_left[0]
                if seconds_left[0] == 0:
                    cue_lbl.configure(text="  Nice job taking a quiet moment.  ")
                elif (elapsed // 4) % 2 == 0:
                    cue_lbl.configure(text="  Breathe in slowly...  ")
                else:
                    cue_lbl.configure(text="  Breathe out gently...  ")
                popup.after(1000, tick)

        popup.after(1000, tick)

    # --------------------------------------------------------------------------
    # SCREEN 1: PROFILE WITH OLIE (NAME & AGE)
    # --------------------------------------------------------------------------
    def show_profile_screen(self) -> None:
        self._clear_stage()

        card = ctk.CTkFrame(
            self.stage,
            fg_color=COLORS["card"],
            border_color=COLORS["border"],
            border_width=1,
            corner_radius=28,
        )
        card.grid(row=0, column=0, sticky="nsew", padx=80, pady=12)
        card.grid_columnconfigure(0, weight=1)

        hero = ctk.CTkFrame(card, fg_color=COLORS["purple"], corner_radius=24)
        hero.grid(row=0, column=0, sticky="ew", padx=10, pady=(10, 0))
        hero.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            hero,
            text="Hi, I am Olie",
            font=ctk.CTkFont(family="Segoe UI", size=28, weight="bold"),
            text_color="#FFFFFF",
        ).grid(row=0, column=0, pady=(28, 6))

        ctk.CTkLabel(
            hero,
            text="I will guide you gently through a short weekly check in.",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color="#F0ECFF",
        ).grid(row=1, column=0, pady=(0, 26))

        body = ctk.CTkFrame(card, fg_color="transparent")
        body.grid(row=1, column=0, sticky="nsew", padx=48, pady=28)
        body.grid_columnconfigure((0, 1), weight=1)

        ctk.CTkLabel(
            body,
            text="Your name",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLORS["text_primary"],
            anchor="w",
        ).grid(row=0, column=0, sticky="w", padx=(0, 8), pady=(0, 6))

        ctk.CTkLabel(
            body,
            text="Your age",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLORS["text_primary"],
            anchor="w",
        ).grid(row=0, column=1, sticky="w", padx=(8, 0), pady=(0, 6))

        self.name_entry = ctk.CTkEntry(
            body,
            height=44,
            corner_radius=14,
            fg_color=COLORS["bg"],
            border_color=COLORS["border"],
            text_color=COLORS["text_primary"],
            placeholder_text="First name",
            font=ctk.CTkFont(family="Segoe UI", size=14),
        )
        self.name_entry.insert(0, self.participant_name)
        self.name_entry.grid(row=1, column=0, sticky="ew", padx=(0, 8), pady=(0, 14))

        self.age_entry = ctk.CTkEntry(
            body,
            height=44,
            corner_radius=14,
            fg_color=COLORS["bg"],
            border_color=COLORS["border"],
            text_color=COLORS["text_primary"],
            placeholder_text="Age",
            font=ctk.CTkFont(family="Segoe UI", size=14),
        )
        self.age_entry.insert(0, self.participant_age)
        self.age_entry.grid(row=1, column=1, sticky="ew", padx=(8, 0), pady=(0, 14))

        self.profile_err_lbl = ctk.CTkLabel(
            body,
            text="",
            font=ctk.CTkFont(family="Segoe UI", size=13),
            text_color="#B42318",
        )
        self.profile_err_lbl.grid(row=2, column=0, columnspan=2, pady=(0, 10))

        ctk.CTkButton(
            body,
            text="Continue",
            height=46,
            corner_radius=23,
            fg_color=COLORS["purple"],
            hover_color=COLORS["purple_hover"],
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=15, weight="bold"),
            command=self._go_sound_screen,
        ).grid(row=3, column=0, columnspan=2, sticky="ew")

    def _go_sound_screen(self) -> None:
        name = self.name_entry.get().strip()
        age = self.age_entry.get().strip()
        if not name:
            self.profile_err_lbl.configure(text="Please enter your name first.")
            return
        if not age.isdigit() or not (10 <= int(age) <= 120):
            self.profile_err_lbl.configure(text="Please enter a valid age.")
            return

        self.participant_name = name
        self.participant_age = age
        self.show_sound_screen()

    # --------------------------------------------------------------------------
    # SCREEN 1B: CHOOSE CALMING SOUND
    # --------------------------------------------------------------------------
    def show_sound_screen(self) -> None:
        self._clear_stage()

        card = ctk.CTkFrame(
            self.stage,
            fg_color=COLORS["card"],
            border_color=COLORS["border"],
            border_width=1,
            corner_radius=28,
        )
        card.grid(row=0, column=0, sticky="nsew", padx=80, pady=12)
        card.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            card,
            text=f"Nice to meet you, {self.participant_name}.",
            font=ctk.CTkFont(family="Segoe UI", size=24, weight="bold"),
            text_color=COLORS["text_primary"],
        ).grid(row=0, column=0, pady=(34, 6))

        ctk.CTkLabel(
            card,
            text="Choose a calming background sound for your check in.",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color=COLORS["text_muted"],
        ).grid(row=1, column=0, pady=(0, 22))

        self.sound_selector = ctk.CTkSegmentedButton(
            card,
            values=["Calm Rain", "Ocean Waves", "Forest Breeze", "None"],
            height=44,
            corner_radius=16,
            selected_color=COLORS["purple"],
            selected_hover_color=COLORS["purple_hover"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            command=self._on_sound_choice_change,
        )
        self.sound_selector.set(self.sound_preference)
        self.sound_selector.grid(row=2, column=0, sticky="ew", padx=48, pady=(0, 16))

        audio_bar = ctk.CTkFrame(
            card,
            fg_color=COLORS["bg"],
            border_color=COLORS["border"],
            border_width=1,
            corner_radius=16,
        )
        audio_bar.grid(row=3, column=0, sticky="ew", padx=48, pady=(0, 26))
        audio_bar.grid_columnconfigure(1, weight=1)

        self.mute_btn = ctk.CTkButton(
            audio_bar,
            text="Unmute" if self.sound_muted else "Mute",
            width=96,
            height=34,
            corner_radius=17,
            fg_color=COLORS["indigo"] if self.sound_muted else COLORS["card"],
            hover_color="#3A1299" if self.sound_muted else COLORS["stage"],
            border_color=COLORS["indigo"] if self.sound_muted else COLORS["border"],
            border_width=1,
            text_color="#FFFFFF" if self.sound_muted else COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            command=self._toggle_sound_mute,
        )
        self.mute_btn.grid(row=0, column=0, padx=(14, 12), pady=10, sticky="w")

        self.volume_slider = ctk.CTkSlider(
            audio_bar,
            from_=0,
            to=100,
            number_of_steps=100,
            button_color=COLORS["purple"],
            button_hover_color=COLORS["purple_hover"],
            progress_color=COLORS["purple"],
            command=self._on_volume_change,
        )
        self.volume_slider.set(0 if self.sound_muted else self.sound_volume)
        self.volume_slider.grid(row=0, column=1, sticky="ew", padx=(0, 10), pady=10)

        self.volume_lbl = ctk.CTkLabel(
            audio_bar,
            text="0%" if self.sound_muted else f"{self.sound_volume}%",
            width=44,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            text_color=COLORS["text_primary"],
            anchor="e",
        )
        self.volume_lbl.grid(row=0, column=2, padx=(0, 14), pady=10, sticky="e")

        self._sync_sound_controls()

        ctk.CTkButton(
            card,
            text="Begin with Olie",
            height=48,
            corner_radius=24,
            fg_color=COLORS["lime"],
            hover_color=COLORS["lime_hover"],
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=15, weight="bold"),
            command=self._start_questions,
        ).grid(row=4, column=0, sticky="ew", padx=48, pady=(0, 34))

    def _on_sound_choice_change(self, choice: str) -> None:
        self.sound_preference = choice
        if choice != "None" and self.sound_muted:
            self.sound_muted = False
        self._sync_sound_controls()

    def _toggle_sound_mute(self) -> None:
        if self.sound_preference == "None":
            return
        self.sound_muted = not self.sound_muted
        self._sync_sound_controls()

    def _on_volume_change(self, val: float) -> None:
        pct = int(round(val))
        self.sound_volume = pct
        if pct > 0 and self.sound_muted:
            self.sound_muted = False
        self._sync_sound_controls()

    def _sync_sound_controls(self) -> None:
        is_none = self.sound_preference == "None"
        self.mute_btn.configure(
            state="disabled" if is_none else "normal",
            text="Unmute" if self.sound_muted else "Mute",
            fg_color=COLORS["indigo"] if self.sound_muted and not is_none else COLORS["card"],
            text_color="#FFFFFF" if self.sound_muted and not is_none else COLORS["text_primary"],
        )
        self.volume_slider.configure(state="disabled" if is_none else "normal")
        display_val = 0 if (is_none or self.sound_muted) else self.sound_volume
        self.volume_slider.set(display_val)
        self.volume_lbl.configure(text=f"{display_val}%")

    def _start_questions(self) -> None:
        self.sound_preference = self.sound_selector.get()
        self.current_index = 0
        self.show_question_screen()

    # --------------------------------------------------------------------------
    # SCREEN 2: INTERACTIVE QUESTION CARD WITH OLIE
    # --------------------------------------------------------------------------
    def _olie_line(self) -> str:
        if self.current_index == 0:
            return f"Hi {self.participant_name}, I am Olie. Let us go through these one at a time."
        if self.current_index < 10:
            return f"{self.participant_name}, take your time. Pick whichever fits your week best."
        if self.current_index < 20:
            return f"{self.participant_name}, you are doing great. Pause for a breath anytime."
        return f"Final question, {self.participant_name}. Take a comfortable breath when you finish."

    def show_question_screen(self) -> None:
        self._clear_stage()

        question = self.questions[self.current_index]
        q_no = question["no"]
        selected_score = self.answers.get(q_no)

        card = ctk.CTkFrame(
            self.stage,
            fg_color=COLORS["card"],
            border_color=COLORS["border"],
            border_width=1,
            corner_radius=28,
        )
        card.grid(row=0, column=0, sticky="nsew")
        card.grid_columnconfigure(0, weight=1)
        card.grid_rowconfigure(1, weight=1)

        stage_top = ctk.CTkFrame(card, fg_color=COLORS["stage"], corner_radius=22)
        stage_top.grid(row=0, column=0, sticky="ew", padx=10, pady=(10, 0))
        stage_top.grid_columnconfigure(0, weight=1)

        row_top = ctk.CTkFrame(stage_top, fg_color="transparent")
        row_top.grid(row=0, column=0, sticky="ew", padx=24, pady=(18, 10))
        row_top.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            row_top,
            text=f"Question {self.current_index + 1} of {self.total_questions}",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLORS["text_primary"],
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            row_top,
            text="Take a Breather",
            width=140,
            height=34,
            corner_radius=17,
            fg_color=COLORS["indigo"],
            hover_color="#3A1299",
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            command=self.open_breather_popup,
        ).grid(row=0, column=1, sticky="e")

        ctk.CTkLabel(
            stage_top,
            text=f"Olie: {self._olie_line()}",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLORS["purple"],
            anchor="w",
        ).grid(row=1, column=0, sticky="w", padx=24, pady=(0, 10))

        progress = ctk.CTkProgressBar(
            stage_top,
            height=10,
            corner_radius=5,
            fg_color="#DCDAD3",
            progress_color=COLORS["lime"],
        )
        progress.set((self.current_index + 1) / self.total_questions)
        progress.grid(row=2, column=0, sticky="ew", padx=24, pady=(0, 18))

        body = ctk.CTkFrame(card, fg_color="transparent")
        body.grid(row=1, column=0, sticky="nsew", padx=36, pady=24)
        body.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            body,
            text=question["statement"],
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color=COLORS["text_primary"],
            wraplength=740,
            justify="left",
            anchor="w",
        ).grid(row=0, column=0, sticky="ew", pady=(0, 6))

        ctk.CTkLabel(
            body,
            text="How often did this happen over the past week?",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color=COLORS["text_muted"],
            anchor="w",
        ).grid(row=1, column=0, sticky="w", pady=(0, 20))

        options_grid = ctk.CTkFrame(body, fg_color="transparent")
        options_grid.grid(row=2, column=0, sticky="ew", pady=(0, 18))
        options_grid.grid_columnconfigure((0, 1), weight=1)

        self.option_rows = []
        for idx, (score, title) in enumerate(RESPONSE_SCALE):
            is_selected = selected_score == score
            r, c = divmod(idx, 2)

            opt_card = ctk.CTkFrame(
                options_grid,
                fg_color=COLORS["purple"] if is_selected else COLORS["bg"],
                border_color=COLORS["purple"] if is_selected else COLORS["border"],
                border_width=1,
                corner_radius=16,
                cursor="hand2",
            )
            opt_card.grid(
                row=r,
                column=c,
                sticky="ew",
                padx=(0 if c == 0 else 8, 8 if c == 0 else 0),
                pady=(0, 12),
            )
            opt_card.grid_columnconfigure(0, weight=1)

            t_lbl = ctk.CTkLabel(
                opt_card,
                text=title,
                font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
                text_color="#FFFFFF" if is_selected else COLORS["text_primary"],
                anchor="w",
            )
            t_lbl.grid(row=0, column=0, sticky="w", padx=20, pady=18)

            for w in (opt_card, t_lbl):
                w.bind("<Button-1>", lambda _e, s=score: self._select_option(s))

            self.option_rows.append((opt_card, t_lbl))

        nav = ctk.CTkFrame(body, fg_color="transparent")
        nav.grid(row=3, column=0, sticky="ew", pady=(10, 0))
        nav.grid_columnconfigure(1, weight=1)

        ctk.CTkButton(
            nav,
            text="Back",
            width=120,
            height=44,
            corner_radius=22,
            fg_color=COLORS["card"],
            hover_color=COLORS["bg"],
            border_color=COLORS["border"],
            border_width=1,
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=14),
            state="normal" if self.current_index > 0 else "disabled",
            command=self._prev_question,
        ).grid(row=0, column=0, sticky="w")

        is_last = self.current_index == self.total_questions - 1
        self.next_btn = ctk.CTkButton(
            nav,
            text="FINISH CHECK IN" if is_last else "CONTINUE",
            width=220,
            height=44,
            corner_radius=22,
            fg_color=COLORS["lime"],
            hover_color=COLORS["lime_hover"],
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            state="normal" if selected_score is not None else "disabled",
            command=self._next_or_finish,
        )
        self.next_btn.grid(row=0, column=2, sticky="e")

    def _select_option(self, score: int) -> None:
        q_no = self.questions[self.current_index]["no"]
        self.answers[q_no] = score

        for idx, (opt_card, t_lbl) in enumerate(self.option_rows):
            active = idx == score
            opt_card.configure(
                fg_color=COLORS["purple"] if active else COLORS["bg"],
                border_color=COLORS["purple"] if active else COLORS["border"],
            )
            t_lbl.configure(text_color="#FFFFFF" if active else COLORS["text_primary"])

        self.next_btn.configure(state="normal")

    def _prev_question(self) -> None:
        if self.current_index > 0:
            self.current_index -= 1
            self.show_question_screen()

    def _next_or_finish(self) -> None:
        q_no = self.questions[self.current_index]["no"]
        if q_no not in self.answers:
            return
        if self.current_index < self.total_questions - 1:
            self.current_index += 1
            self.show_question_screen()
        else:
            self.show_results_screen()

    def _compute_results(self) -> list[dict]:
        raw_sums = {"D": 0, "A": 0, "S": 0}
        for q in self.questions:
            raw_sums[q["level"]] += self.answers.get(q["no"], 0)

        results = []
        for code in ("D", "A", "S"):
            raw = raw_sums[code]
            final = raw * 2
            clinical_label, friendly_label = classify_severity(code, final)
            results.append(
                {
                    "code": code,
                    "friendly_name": FRIENDLY_NAMES[code],
                    "clinical_name": CLINICAL_NAMES[code],
                    "raw": raw,
                    "final": final,
                    "clinical_severity": clinical_label,
                    "friendly_severity": friendly_label,
                }
            )
        return results

    def show_results_screen(self) -> None:
        self._clear_stage()
        self.latest_results = self._compute_results()

        card = ctk.CTkFrame(
            self.stage,
            fg_color=COLORS["card"],
            border_color=COLORS["border"],
            border_width=1,
            corner_radius=28,
        )
        card.grid(row=0, column=0, sticky="nsew")
        card.grid_columnconfigure(0, weight=1)

        hero = ctk.CTkFrame(card, fg_color=COLORS["purple"], corner_radius=24)
        hero.grid(row=0, column=0, sticky="ew", padx=10, pady=(10, 0))
        hero.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            hero,
            text=f"You did it, {self.participant_name}!",
            font=ctk.CTkFont(family="Segoe UI", size=26, weight="bold"),
            text_color="#FFFFFF",
        ).grid(row=0, column=0, pady=(24, 6))

        ctk.CTkLabel(
            hero,
            text="Olie is proud of you for taking a quiet moment for yourself today.",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color="#F0ECFF",
        ).grid(row=1, column=0, pady=(0, 22))

        body = ctk.CTkFrame(card, fg_color="transparent")
        body.grid(row=1, column=0, sticky="nsew", padx=32, pady=24)
        body.grid_columnconfigure(0, weight=1)

        cards_row = ctk.CTkFrame(body, fg_color="transparent")
        cards_row.grid(row=0, column=0, sticky="ew", pady=(0, 18))
        cards_row.grid_columnconfigure((0, 1, 2), weight=1)

        pastel_fills = [COLORS["sunny"], COLORS["pink"], COLORS["sky"]]
        for col, res in enumerate(self.latest_results):
            tile = ctk.CTkFrame(cards_row, fg_color=pastel_fills[col], corner_radius=20)
            tile.grid(
                row=0,
                column=col,
                sticky="nsew",
                padx=(0 if col == 0 else 8, 0 if col == 2 else 8),
            )
            tile.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(
                tile,
                text=res["friendly_name"],
                font=ctk.CTkFont(family="Segoe UI", size=17, weight="bold"),
                text_color=COLORS["text_primary"],
                anchor="w",
            ).grid(row=0, column=0, sticky="w", padx=20, pady=(22, 12))

            ctk.CTkLabel(
                tile,
                text=f"  {res['friendly_severity']}  ",
                fg_color="#FFFFFF",
                text_color=COLORS["text_primary"],
                corner_radius=12,
                height=32,
                font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            ).grid(row=1, column=0, sticky="w", padx=20, pady=(0, 22))

        note_box = ctk.CTkFrame(body, fg_color="#F3F1FC", corner_radius=16)
        note_box.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        ctk.CTkLabel(
            note_box,
            text=SUPPORT_NOTE,
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color="#2A2D38",
            wraplength=730,
            justify="left",
        ).pack(anchor="w", padx=20, pady=14)

        actions = ctk.CTkFrame(body, fg_color="transparent")
        actions.grid(row=2, column=0, sticky="ew")
        actions.grid_columnconfigure(0, weight=1)

        self.save_status_lbl = ctk.CTkLabel(
            actions,
            text="",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            text_color=COLORS["purple"],
            anchor="w",
        )
        self.save_status_lbl.grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            actions,
            text="Start Over",
            width=130,
            height=44,
            corner_radius=22,
            fg_color=COLORS["card"],
            hover_color=COLORS["bg"],
            border_color=COLORS["border"],
            border_width=1,
            text_color=COLORS["text_primary"],
            font=ctk.CTkFont(family="Segoe UI", size=14),
            command=self._retake,
        ).grid(row=0, column=1, padx=(0, 12))

        ctk.CTkButton(
            actions,
            text="Save My Summary",
            width=185,
            height=44,
            corner_radius=22,
            fg_color=COLORS["purple"],
            hover_color=COLORS["purple_hover"],
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            command=self._save_reports,
        ).grid(row=0, column=2)

    def _save_reports(self) -> None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        txt_path = Path(f"checkin_summary_{timestamp}.txt")
        xlsx_path = Path(f"dass21_report_{timestamp}.xlsx")

        participant = self.participant_name or "Friend"
        age = self.participant_age or "Not provided"
        lines = [
            "WEEKLY MIND AND MOOD CHECK IN SUMMARY",
            f"Name: {participant} (Age {age})",
            f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "-" * 52,
        ]
        for res in self.latest_results:
            lines.append(f"{res['friendly_name']:18s} {res['friendly_severity']}")
        lines.extend(["-" * 52, "", SUPPORT_NOTE])
        txt_path.write_text("\n".join(lines), encoding="utf-8")

        summary_df = pd.DataFrame(
            [
                {
                    "Participant": participant,
                    "Age": age,
                    "Sound": self.sound_preference,
                    "Subscale": r["clinical_name"],
                    "Code": r["code"],
                    "Raw Sum": r["raw"],
                    "Final Score (x2)": r["final"],
                    "Severity": r["clinical_severity"],
                }
                for r in self.latest_results
            ]
        )
        responses_df = pd.DataFrame(
            [
                {
                    "No.": q["no"],
                    "Category": q["level"],
                    "Statement": q["statement"],
                    "Response (0-3)": self.answers.get(q["no"], 0),
                }
                for q in self.questions
            ]
        )
        with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
            summary_df.to_excel(writer, sheet_name="Summary", index=False)
            responses_df.to_excel(writer, sheet_name="Item Responses", index=False)

        self.save_status_lbl.configure(text="Summary saved cleanly.")

    def _retake(self) -> None:
        self.answers.clear()
        self.current_index = 0
        self.show_profile_screen()


if __name__ == "__main__":
    app = DASS21App()
    app.mainloop()
