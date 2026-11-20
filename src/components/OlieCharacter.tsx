import { ReactNode } from 'react';

export type OlieMood =
  | 'welcome'
  | 'admin'
  | 'celebrate'
  | 'breathe'
  | 'activity-water'
  | 'activity-shoulders'
  | 'activity-window'
  | 'activity-hello';

interface OlieCharacterProps {
  mood?: OlieMood;
  excited?: boolean;
  phase?: 'inhale' | 'exhale';
  onTap?: () => void;
  message?: string;
  roleLabel?: string;
  className?: string;
}

export function OlieCharacter({
  mood = 'admin',
  excited = false,
  phase = 'inhale',
  onTap,
  message,
  roleLabel = 'Olie, Your Digital Guide',
  className = '',
}: OlieCharacterProps) {
  const renderArtwork = (): ReactNode => {
    if (mood === 'welcome') {
      return (
        <svg
          viewBox="-24 -26 308 214"
          className="w-64 h-44 sm:w-72 sm:h-48 mx-auto drop-shadow-md select-none overflow-visible"
          aria-hidden="true"
        >
          {/* Warm Sun + Soft Cloud Backdrop inspired by sky check-in card */}
          <circle cx="222" cy="34" r="34" fill="#FFE65B" opacity="0.35" className="olie-idle-halo" />
          <circle cx="222" cy="34" r="22" fill="#FFE042" />

          <g className="olie-cloud-glide">
            <path
              d="M-6 58 C-6 44 10 38 20 44 C28 34 46 38 48 50 C58 52 62 66 50 70 L-2 70 C-12 70 -12 60 -6 58 Z"
              fill="#FFFFFF"
              opacity="0.92"
            />
            <path
              d="M196 96 C196 86 208 82 215 86 C222 78 236 81 238 91 C246 92 248 103 239 105 L200 105 C192 105 192 97 196 96 Z"
              fill="#FFFFFF"
              opacity="0.88"
            />
          </g>

          {/* Twinkling Sparkles */}
          <path
            d="M32 102 L36 110 L44 114 L36 118 L32 126 L28 118 L20 114 L28 110 Z"
            fill="#FFF59D"
            className="olie-idle-twinkle"
          />
          <path
            d="M236 62 L240 69 L247 73 L240 77 L236 84 L232 77 L225 73 L232 69 Z"
            fill="#FFFFFF"
            className="olie-idle-twinkle-delay"
          />

          {/* Anchored Swaying Body extending past bottom border so there is never a cut gap */}
          <g className="olie-idle-sway">
            <path
              d="M28 202 C34 94 74 36 122 28 L130 8 L144 27 L158 10 L164 30 C200 48 224 100 230 202 Z"
              fill="#F8F054"
              stroke="#E6D930"
              strokeWidth="3"
            />
            <ellipse cx="82" cy="128" rx="16" ry="10" fill="#FFB0C4" />
            <ellipse cx="178" cy="128" rx="16" ry="10" fill="#FFB0C4" />

            <g className="olie-idle-blink">
              <circle cx="98" cy="103" r="6.5" fill="#1E2028" />
              <circle cx="162" cy="103" r="6.5" fill="#1E2028" />
              <circle cx="100.5" cy="100.5" r="2.3" fill="#FFFFFF" />
              <circle cx="164.5" cy="100.5" r="2.3" fill="#FFFFFF" />
            </g>
            <circle cx="98" cy="103" r="17" fill="none" stroke="#4E39B8" strokeWidth="3.2" />
            <circle cx="162" cy="103" r="17" fill="none" stroke="#4E39B8" strokeWidth="3.2" />
            <path d="M115 103 Q130 98 145 103" fill="none" stroke="#4E39B8" strokeWidth="3.2" />

            <path
              d="M119 124 Q130 138 141 124"
              fill="none"
              stroke="#1E2028"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
    }

    if (mood === 'celebrate') {
      return (
        <svg
          viewBox="-44 -26 328 232"
          className="w-72 h-44 sm:w-80 sm:h-48 mx-auto select-none drop-shadow-md overflow-visible"
          aria-hidden="true"
        >
          {/* Celebration Sparkles */}
          <path
            d="M12 76 L17 86 L27 91 L17 96 L12 106 L7 96 L-3 91 L7 86 Z"
            fill="#FFFFFF"
            className="olie-idle-twinkle"
          />
          <path
            d="M234 86 L238 94 L246 98 L238 102 L234 110 L230 102 L222 98 L230 94 Z"
            fill="#FFFFFF"
            className="olie-idle-twinkle-delay"
          />
          <path
            d="M72 22 L76 29 L83 33 L76 37 L72 44 L68 37 L61 33 L68 29 Z"
            fill="#FFF59D"
            className="olie-idle-twinkle"
          />
          <path
            d="M188 18 L206 23 L192 34 L210 39"
            fill="none"
            stroke="#FFF16B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Sky-Blue Cloud Buddy */}
          <g className="olie-idle-float">
            <path
              d="M-6 154 C-10 118 14 90 42 90 C68 90 88 118 84 154 C80 172 -2 172 -6 154 Z"
              fill="#8AD4FF"
              stroke="#67BDF4"
              strokeWidth="2.5"
            />
            <ellipse cx="22" cy="134" rx="7" ry="4.5" fill="#FFB0C4" />
            <ellipse cx="56" cy="134" rx="7" ry="4.5" fill="#FFB0C4" />
            <circle cx="30" cy="122" r="4" fill="#1E2028" />
            <circle cx="48" cy="122" r="4" fill="#1E2028" />
            <path d="M33 134 Q39 142 45 134" fill="none" stroke="#1E2028" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Right Blossom-Coral Cloud Buddy */}
          <g className="olie-idle-float">
            <path
              d="M162 154 C158 118 178 90 206 90 C234 90 254 118 250 154 C246 172 166 172 162 154 Z"
              fill="#FFADCE"
              stroke="#F388B5"
              strokeWidth="2.5"
            />
            <ellipse cx="188" cy="134" rx="7" ry="4.5" fill="#FFE3EE" />
            <ellipse cx="224" cy="134" rx="7" ry="4.5" fill="#FFE3EE" />
            <circle cx="196" cy="122" r="4" fill="#1E2028" />
            <circle cx="216" cy="122" r="4" fill="#1E2028" />
            <path d="M200 134 Q206 142 212 134" fill="none" stroke="#1E2028" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Center Star Olie Cheering */}
          <g className="olie-idle-sway olie-idle-float">
            <g className="olie-idle-breathe">
              <path
                d="M52 156 C48 92 72 44 106 34 L114 16 L124 32 L138 18 L142 36 C172 52 188 94 184 156 C180 178 56 178 52 156 Z"
                fill="#F8F054"
                stroke="#E6D930"
                strokeWidth="3"
              />
              <ellipse cx="82" cy="116" rx="14" ry="9" fill="#FFB0C4" />
              <ellipse cx="158" cy="116" rx="14" ry="9" fill="#FFB0C4" />

              <g className="olie-idle-blink">
                <circle cx="98" cy="96" r="6.5" fill="#1E2028" />
                <circle cx="142" cy="96" r="6.5" fill="#1E2028" />
                <circle cx="100" cy="93.5" r="2.2" fill="#FFFFFF" />
                <circle cx="144" cy="93.5" r="2.2" fill="#FFFFFF" />
              </g>
              <circle cx="98" cy="96" r="15" fill="none" stroke="#4E39B8" strokeWidth="3" />
              <circle cx="142" cy="96" r="15" fill="none" stroke="#4E39B8" strokeWidth="3" />
              <path d="M113 96 Q120 92 127 96" fill="none" stroke="#4E39B8" strokeWidth="3" />

              <path d="M108 114 Q120 138 132 114 Z" fill="#1E2028" />
              <path d="M113 124 Q120 133 127 124 Z" fill="#FF7A9E" />
            </g>
          </g>
        </svg>
      );
    }

    if (mood === 'breathe') {
      return (
        <svg
          viewBox="-24 -22 268 232"
          className={`w-52 h-44 mx-auto select-none overflow-visible transition-transform duration-[3600ms] ease-in-out ${
            phase === 'inhale' ? 'scale-108' : 'scale-95'
          }`}
          aria-hidden="true"
        >
          <path
            d="M150 48 C150 40 162 40 162 48 C162 56 150 64 150 64 C150 64 138 56 138 48 C138 40 150 40 150 48 Z"
            fill="#FFB6C8"
            className="olie-idle-float"
          />
          <path
            d="M174 68 C174 62 183 62 183 68 C183 74 174 80 174 80 C174 80 165 74 165 68 C165 62 174 62 174 68 Z"
            fill="#FFD2DD"
            className="olie-idle-twinkle-delay"
          />

          <path d="M74 136 L66 180 L88 180 L94 140 Z" fill="#92D5FF" />
          <path d="M126 136 L134 180 L112 180 L106 140 Z" fill="#92D5FF" />
          <path
            d="M54 96 C38 102 38 120 56 124"
            fill="none"
            stroke="#92D5FF"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M146 96 C162 102 162 120 144 124"
            fill="none"
            stroke="#92D5FF"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <path
            d="M52 132 C48 80 68 42 94 34 L100 18 L110 32 L122 22 L124 38 C146 52 154 88 148 132 C144 150 56 150 52 132 Z"
            fill="#92D5FF"
          />

          <path
            d="M78 82 Q86 90 94 82"
            fill="none"
            stroke="#1E2028"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M108 82 Q116 90 124 82"
            fill="none"
            stroke="#1E2028"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="101" cy="100" r="4.5" fill="none" stroke="#1E2028" strokeWidth="3.5" />
        </svg>
      );
    }

    if (mood === 'activity-water') {
      // Proper animated cartoon: Olie tilts head back gently, raises glass to lips, water sparkles pop!
      return (
        <svg
          viewBox="-24 -22 288 230"
          className="w-60 h-48 mx-auto select-none drop-shadow-md overflow-visible olie-idle-float"
          aria-hidden="true"
        >
          <circle cx="120" cy="98" r="82" fill="#BCE3FF" opacity="0.34" className="olie-idle-halo" />

          {/* Refreshing Water Drop Sparkles popping as Olie sips */}
          <g className="olie-refresh-pop">
            <path d="M54 44 C54 44 62 56 62 62 C62 66.5 58.4 70 54 70 C49.6 70 46 66.5 46 62 C46 56 54 44 54 44 Z" fill="#63B4F5" />
            <path d="M188 38 L192 46 L200 50 L192 54 L188 62 L184 54 L176 50 L184 46 Z" fill="#63B4F5" />
            <circle cx="74" cy="34" r="4" fill="#FFFFFF" />
          </g>

          {/* Legs */}
          <path d="M88 138 L78 178 L98 178 L106 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />
          <path d="M148 138 L158 178 L138 178 L130 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />

          {/* Head + Body tilting slightly back to sip */}
          <g className="olie-head-drink-tilt">
            {/* Left Relaxed Arm */}
            <path
              d="M72 96 C54 106 54 124 68 128 C76 130 82 118 82 106 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />

            {/* Body */}
            <path
              d="M68 134 C66 76 88 36 116 30 L122 14 L132 28 L146 16 L148 32 C172 48 176 90 172 134 C168 150 72 150 68 134 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            <ellipse cx="92" cy="96" rx="11" ry="7" fill="#FFB0C4" />
            <ellipse cx="148" cy="96" rx="11" ry="7" fill="#FFB0C4" />

            {/* Happy Peaceful Eyes + Glasses */}
            <path d="M95 79 Q104 71 113 79" fill="none" stroke="#1E2028" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M127 79 Q136 71 145 79" fill="none" stroke="#1E2028" strokeWidth="3.8" strokeLinecap="round" />
            <circle cx="104" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <circle cx="136" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <path d="M117.5 78 Q120 74 122.5 78" fill="none" stroke="#4E39B8" strokeWidth="2.6" />

            {/* Sipping Mouth */}
            <ellipse cx="120" cy="99" rx="5.5" ry="4.5" fill="#1E2028" />
          </g>

          {/* Right Arm + Cool Water Glass lifting all the way up to mouth */}
          <g className="olie-cartoon-drink-arm">
            <path
              d="M158 106 C174 110 184 122 176 130 C170 136 158 128 160 118 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            {/* Glass */}
            <path
              d="M168 88 L198 88 L193 130 L173 130 Z"
              fill="#E8F6FF"
              stroke="#4CA3EB"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {/* Cool Water Inside + Ice Cubes */}
            <path d="M170.5 102 Q183 97 195.5 102 L191.5 127 L174.5 127 Z" fill="#6EC2FF" />
            <rect x="176" y="104" width="7" height="7" rx="1.5" fill="#FFFFFF" opacity="0.7" transform="rotate(14 179 107)" />
            <rect x="184" y="106" width="6" height="6" rx="1.5" fill="#FFFFFF" opacity="0.6" transform="rotate(-10 187 109)" />
            <line x1="176" y1="94" x2="178" y2="120" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          </g>
        </svg>
      );
    }

    if (mood === 'activity-shoulders') {
      // Proper animated cartoon: Olie visibly shrugs shoulders up then melts them down with a soft breath puff!
      return (
        <svg
          viewBox="-24 -22 288 230"
          className="w-60 h-48 mx-auto select-none drop-shadow-md overflow-visible"
          aria-hidden="true"
        >
          <circle cx="120" cy="96" r="82" fill="#B5A4FF" opacity="0.28" className="olie-idle-halo" />

          {/* Downward Cartoon Release Chevrons */}
          <g className="olie-shoulder-melt">
            <path d="M40 62 L40 94 M32 86 L40 94 L48 86" fill="none" stroke="#7F62FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M200 62 L200 94 M192 86 L200 94 L208 86" fill="none" stroke="#7F62FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Legs */}
          <path d="M88 138 L78 178 L98 178 L106 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />
          <path d="M148 138 L158 178 L138 178 L130 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />

          {/* Body gently shrugging then melting down */}
          <g className="olie-shoulder-body-melt">
            <path
              d="M68 134 C66 76 88 36 116 30 L122 14 L132 28 L146 16 L148 32 C172 48 176 90 172 134 C168 150 72 150 68 134 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            <ellipse cx="92" cy="96" rx="11" ry="7" fill="#FFB0C4" />
            <ellipse cx="148" cy="96" rx="11" ry="7" fill="#FFB0C4" />

            {/* Soft Relaxed Closed Eyes + Glasses */}
            <path d="M95 79 Q104 88 113 79" fill="none" stroke="#1E2028" strokeWidth="4" strokeLinecap="round" />
            <path d="M127 79 Q136 88 145 79" fill="none" stroke="#1E2028" strokeWidth="4" strokeLinecap="round" />
            <circle cx="104" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <circle cx="136" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <path d="M117.5 78 Q120 74 122.5 78" fill="none" stroke="#4E39B8" strokeWidth="2.6" />

            {/* Relaxed Unclenched Exhale Mouth */}
            <ellipse cx="120" cy="100" rx="6.5" ry="4.5" fill="none" stroke="#1E2028" strokeWidth="3.2" />
          </g>

          {/* Cartoon Shoulders & Arms Shrugging High & Melting Low */}
          <g className="olie-shoulder-melt">
            <path
              d="M70 88 C50 96 46 122 60 132 C70 138 78 122 76 106 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            <path
              d="M170 88 C190 96 194 122 180 132 C170 138 162 122 164 106 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
          </g>

          {/* Soft Cartoon Breath Puff Exhale */}
          <g className="olie-exhale-breath">
            <path
              d="M132 104 Q146 98 156 105 Q166 111 174 104"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="179" cy="102" r="4" fill="#FFFFFF" opacity="0.85" />
          </g>
        </svg>
      );
    }

    if (mood === 'activity-window') {
      // Proper animated cartoon scene: Cozy sunlit window, swaying curtains, gliding birds, drifting clouds, Olie gazing out!
      return (
        <svg
          viewBox="-24 -22 298 230"
          className="w-64 h-48 mx-auto select-none drop-shadow-md overflow-visible"
          aria-hidden="true"
        >
          {/* Window Sky Clip Area */}
          <defs>
            <clipPath id="olie-window-sky">
              <rect x="24" y="16" width="124" height="112" rx="14" />
            </clipPath>
          </defs>

          <rect x="22" y="14" width="128" height="116" rx="16" fill="#C9E9FF" stroke="#7F62FF" strokeWidth="4" />

          <g clipPath="url(#olie-window-sky)">
            {/* Warm Pulsing Sun */}
            <circle cx="56" cy="44" r="18" fill="#FFF59D" opacity="0.55" className="olie-idle-halo" />
            <circle cx="56" cy="44" r="12" fill="#FFE64D" />

            {/* Drifting Fluffy Clouds */}
            <g className="olie-cloud-glide">
              <path
                d="M66 64 C66 56 76 52 82 56 C88 50 100 53 102 62 C108 63 110 72 102 74 L68 74 C62 74 62 65 66 64 Z"
                fill="#FFFFFF"
              />
              <path
                d="M104 94 C104 88 112 85 116 88 C120 84 130 86 132 92 C136 93 137 100 131 101 L106 101 C101 101 101 95 104 94 Z"
                fill="#FFFFFF"
                opacity="0.85"
              />
            </g>

            {/* Distant Cartoon Birds Gliding Past */}
            <g className="olie-bird-glide">
              <path d="M44 82 Q49 77 54 82 Q59 77 64 82" fill="none" stroke="#4E39B8" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M68 70 Q72 66 76 70 Q80 66 84 70" fill="none" stroke="#4E39B8" strokeWidth="1.9" strokeLinecap="round" />
            </g>
          </g>

          {/* Window Crossbars */}
          <line x1="86" y1="14" x2="86" y2="130" stroke="#7F62FF" strokeWidth="3" />
          <line x1="22" y1="72" x2="150" y2="72" stroke="#7F62FF" strokeWidth="3" />

          {/* Gently Swaying Side Curtain */}
          <path
            d="M22 14 C36 42 36 88 26 130 L14 130 L14 14 Z"
            fill="#B5A4FF"
            className="olie-curtain-sway"
          />

          {/* Olie Gazing Out Peacefully */}
          <g className="olie-idle-float">
            <path d="M150 140 L142 176 L160 176 L166 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />
            <path d="M198 140 L206 176 L188 176 L182 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />
            <path
              d="M134 136 C132 82 150 44 174 38 L180 24 L189 36 L201 26 L203 40 C224 54 226 94 222 136 C218 150 138 150 134 136 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            <ellipse cx="152" cy="96" rx="10" ry="6.5" fill="#FFB0C4" />
            <g className="olie-window-gaze">
              <g className="olie-idle-blink">
                <circle cx="156" cy="80" r="5" fill="#1E2028" />
                <circle cx="184" cy="80" r="5" fill="#1E2028" />
                <circle cx="154" cy="78" r="1.8" fill="#FFFFFF" />
                <circle cx="182" cy="78" r="1.8" fill="#FFFFFF" />
              </g>
            </g>
            <circle cx="156" cy="80" r="12" fill="none" stroke="#4E39B8" strokeWidth="2.4" />
            <circle cx="184" cy="80" r="12" fill="none" stroke="#4E39B8" strokeWidth="2.4" />
            <path d="M168 80 L172 80" stroke="#4E39B8" strokeWidth="2.4" />
            <path d="M162 98 Q170 107 178 98" fill="none" stroke="#1E2028" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </svg>
      );
    }

    if (mood === 'activity-hello') {
      // Proper animated cartoon: Olie waves joyfully while a cute heart letter launches & flies across!
      return (
        <svg
          viewBox="-24 -26 288 236"
          className="w-60 h-48 mx-auto select-none drop-shadow-md overflow-visible olie-idle-float"
          aria-hidden="true"
        >
          <circle cx="116" cy="96" r="82" fill="#FFD6E0" opacity="0.34" className="olie-idle-halo" />

          {/* Floating Hearts */}
          <path
            d="M46 48 C46 41 56 41 56 48 C56 55 46 62 46 62 C46 62 36 55 36 48 C36 41 46 41 46 48 Z"
            fill="#FFB0C4"
            className="olie-heart-float"
          />

          <g className="olie-idle-sway">
            <path d="M84 138 L74 178 L94 178 L102 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />
            <path d="M144 138 L154 178 L134 178 L126 142 Z" fill="#F8F054" stroke="#E0D22B" strokeWidth="2.5" />

            {/* Waving Left Arm */}
            <g className="olie-idle-wave">
              <path
                d="M68 96 C46 84 40 56 52 42 C60 34 70 42 67 58 C64 70 74 78 82 82 Z"
                fill="#F8F054"
                stroke="#E0D22B"
                strokeWidth="2.5"
              />
            </g>

            {/* Right Sending Arm */}
            <path
              d="M162 94 C178 96 186 108 178 118 C172 124 162 116 164 106 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />

            {/* Body */}
            <path
              d="M64 134 C62 76 84 36 112 30 L118 14 L128 28 L142 16 L144 32 C168 48 172 90 168 134 C164 150 68 150 64 134 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
            <ellipse cx="88" cy="96" rx="11" ry="7" fill="#FFB0C4" />
            <ellipse cx="144" cy="96" rx="11" ry="7" fill="#FFB0C4" />

            <g className="olie-idle-blink">
              <circle cx="100" cy="78" r="5.5" fill="#1E2028" />
              <circle cx="132" cy="78" r="5.5" fill="#1E2028" />
              <circle cx="102" cy="76" r="1.9" fill="#FFFFFF" />
              <circle cx="134" cy="76" r="1.9" fill="#FFFFFF" />
            </g>
            <circle cx="100" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <circle cx="132" cy="78" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <path d="M113.5 78 Q116 74 118.5 78" fill="none" stroke="#4E39B8" strokeWidth="2.6" />

            <path d="M106 94 Q116 110 126 94 Z" fill="#1E2028" />
            <path d="M110 100 Q116 107 122 100 Z" fill="#FF7A9E" />
          </g>

          {/* Animated Heart Letter Flying Joyfully Across Sky */}
          <g className="olie-letter-fly" transform="translate(154, 78)">
            <rect x="0" y="0" width="38" height="26" rx="6" fill="#FFFFFF" stroke="#7F62FF" strokeWidth="2.5" />
            <path d="M2 4 L19 16 L36 4" fill="none" stroke="#7F62FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 12 C19 9 23 9 23 12 C23 15 19 18 19 18 C19 18 15 15 15 12 C15 9 19 9 19 12 Z" fill="#FF7A9E" />
          </g>
        </svg>
      );
    }

    // Default: 'admin' — Olie Digital Test Administrator with generous padded viewBox & overflow-visible
    return (
      <svg
        viewBox="-26 -24 264 236"
        className={`w-40 h-40 sm:w-44 sm:h-44 select-none drop-shadow-sm overflow-visible ${
          excited ? 'olie-excited-hop' : 'olie-idle-float'
        }`}
        aria-hidden="true"
      >
        <circle cx="104" cy="94" r="78" fill="#FFFFFF" className="olie-idle-halo" />

        <path
          d="M22 118 L26 126 L34 130 L26 134 L22 142 L18 134 L10 130 L18 126 Z"
          fill="#7F62FF"
          className="olie-idle-twinkle"
        />
        <path
          d="M178 34 L182 42 L190 46 L182 50 L178 58 L174 50 L166 46 L174 42 Z"
          fill="#7F62FF"
          className="olie-idle-twinkle-delay"
        />

        <g className="olie-idle-sway">
          <path
            d="M70 136 L58 178 L80 178 L90 140 Z"
            fill="#F8F054"
            stroke="#E0D22B"
            strokeWidth="2.5"
          />
          <path
            d="M134 136 L146 178 L124 178 L114 140 Z"
            fill="#F8F054"
            stroke="#E0D22B"
            strokeWidth="2.5"
          />

          <g className="olie-idle-wave">
            <path
              d="M56 94 C34 82 28 54 40 40 C48 32 58 40 55 56 C52 68 62 76 70 80 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />
          </g>

          <path
            d="M146 92 C164 100 170 116 162 126 C156 132 146 126 148 116 C148 108 144 104 138 102 Z"
            fill="#F8F054"
            stroke="#E0D22B"
            strokeWidth="2.5"
          />
          <g transform="translate(152, 102)" className="olie-idle-clipboard">
            <rect
              x="0"
              y="4"
              width="28"
              height="34"
              rx="6"
              fill="#FFFFFF"
              stroke="#7F62FF"
              strokeWidth="2.5"
            />
            <rect x="8" y="0" width="12" height="6" rx="2.5" fill="#7F62FF" />
            <path
              d="M7 18 L12 23 L21 13"
              fill="none"
              stroke="#6FB510"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="7"
              y1="29"
              x2="21"
              y2="29"
              stroke="#C5C1D6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          <g className="olie-idle-breathe">
            <path
              d="M50 132 C48 74 70 34 98 28 L104 12 L114 26 L128 14 L130 30 C154 46 158 88 154 132 C150 148 54 148 50 132 Z"
              fill="#F8F054"
              stroke="#E0D22B"
              strokeWidth="2.5"
            />

            <ellipse cx="74" cy="94" rx="11" ry="7" fill="#FFB0C4" />
            <ellipse cx="130" cy="94" rx="11" ry="7" fill="#FFB0C4" />

            <g className="olie-idle-blink">
              <circle cx="86" cy="76" r="5.6" fill="#1E2028" />
              <circle cx="118" cy="76" r="5.6" fill="#1E2028" />
              <circle cx="88" cy="74" r="2" fill="#FFFFFF" />
              <circle cx="120" cy="74" r="2" fill="#FFFFFF" />
            </g>

            <circle cx="86" cy="76" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <circle cx="118" cy="76" r="13.5" fill="none" stroke="#4E39B8" strokeWidth="2.6" />
            <path d="M99.5 76 Q102 72 104.5 76" fill="none" stroke="#4E39B8" strokeWidth="2.6" />

            <path
              d="M92 92 Q102 109 112 92 Z"
              fill="#1E2028"
              stroke="#1E2028"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M96 99 Q102 106 108 99 Z" fill="#FF7A9E" />
          </g>
        </g>
      </svg>
    );
  };

  const characterVisual = onTap ? (
    <button
      type="button"
      onClick={onTap}
      className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7F62FF] rounded-full shrink-0 p-2 overflow-visible transition-transform duration-200 hover:scale-[1.04] active:scale-95"
      aria-label="Tap Olie for a calm encouraging note"
      title="Tap Olie"
    >
      {renderArtwork()}
    </button>
  ) : (
    <div className="shrink-0 overflow-visible">{renderArtwork()}</div>
  );

  if (!message) {
    return <div className={`overflow-visible ${className}`}>{characterVisual}</div>;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 overflow-visible ${className}`}>
      {characterVisual}
      <div className="bg-white rounded-2xl px-5 py-3.5 shadow-sm border border-[#DFDCD3] max-w-md min-h-[78px] flex flex-col justify-center text-center sm:text-left">
        <div className="text-xs font-bold tracking-wide text-[#7F62FF]">{roleLabel}</div>
        <p className="text-sm sm:text-[15px] font-medium text-[#1E2028] mt-0.5 leading-snug">
          {message}
        </p>
      </div>
    </div>
  );
}
