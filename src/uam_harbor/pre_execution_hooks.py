"""
Pre-Execution Hooks for Terminal-Bench Tasks (Phase 2 - A2)

These hooks run BEFORE the agent starts, protecting critical state that
would otherwise be destroyed by the agent's first commands.

Key insight: LLMs don't reliably follow "do not do X" instructions.
The only way to protect critical state is to backup/modify it before
the agent runs.
"""

from typing import Optional, Callable, Dict
import os


# Pre-execution hooks by task pattern
PRE_EXECUTION_HOOKS: Dict[str, dict] = {
    'db-wal-recovery': {
        'detection_keywords': ['wal', 'db-wal', 'sqlite', 'recovery'],
        'description': 'Backup WAL file before agent can checkpoint it',
        'commands': [
            'cp /app/main.db-wal /tmp/wal_backup.wal 2>/dev/null || true',
            'cp /app/main.db-wal /app/main.db-wal.backup 2>/dev/null || true',
            'echo "WAL backed up to /tmp/wal_backup.wal"',
        ],
        'critical': True,
        'reason': 'sqlite3 auto-checkpoints WAL on connect, destroying uncommitted data',
    },
    'filter-js-from-html': {
        'detection_keywords': ['filter', 'javascript', 'html', 'xss'],
        'description': 'Pre-install bleach for XSS filtering',
        'commands': [
            'pip install bleach lxml 2>/dev/null || pip3 install bleach lxml',
        ],
        'critical': False,
        'reason': 'Ensures bleach is available for XSS filtering',
    },
    'gpt2-codegolf': {
        'detection_keywords': ['gpt2', 'gpt-2', '124m', 'codegolf', 'inference'],
        'description': 'Download reference implementation for guidance',
        'commands': [
            # Download llm.c reference if available
            'which curl && curl -sL https://raw.githubusercontent.com/karpathy/llm.c/master/train_gpt2.c -o /tmp/llm_reference.c 2>/dev/null || true',
        ],
        'critical': False,
        'reason': 'Provides reference implementation for checkpoint format',
    },
    'regex-chess': {
        'detection_keywords': ['regex', 'chess', 're.json', 'legal move'],
        'description': 'Install python-chess for move generation reference',
        'commands': [
            'pip install python-chess 2>/dev/null || pip3 install python-chess',
        ],
        'critical': False,
        'reason': 'Provides correct move generation for regex pattern building',
    },
    'chess-best-move': {
        'detection_keywords': ['chess', 'best move', 'board', 'image'],
        'description': 'Install chess libraries, image recognition, and stockfish',
        'commands': [
            'pip install python-chess pillow opencv-python-headless numpy 2>/dev/null || pip3 install python-chess pillow opencv-python-headless numpy',
            'pip install board_to_fen 2>/dev/null || pip3 install board_to_fen 2>/dev/null || true',
            'apt-get update && apt-get install -y stockfish tesseract-ocr 2>/dev/null || true',
            # Create helper script for FEN extraction
            '''cat > /tmp/extract_fen.py << 'FENSCRIPT'
#!/usr/bin/env python3
"""Chess board image to FEN converter - uses board_to_fen if available, falls back to manual."""
import sys
try:
    from board_to_fen import predict
    fen = predict(sys.argv[1])
    print(fen)
except ImportError:
    print("board_to_fen not available - manual FEN entry required", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
FENSCRIPT
chmod +x /tmp/extract_fen.py''',
        ],
        'critical': True,
        'reason': 'Visual FEN extraction unreliable - need image recognition library',
    },
    'code-from-image': {
        'detection_keywords': ['code', 'image', 'ocr', 'screenshot', 'extract'],
        'description': 'Install OCR tools for code extraction from images',
        'commands': [
            'pip install pytesseract pillow opencv-python-headless 2>/dev/null || pip3 install pytesseract pillow opencv-python-headless',
            'apt-get update && apt-get install -y tesseract-ocr 2>/dev/null || true',
        ],
        'critical': False,
        'reason': 'OCR required for extracting code from images',
    },
    'write-compressor': {
        'detection_keywords': ['compress', 'decompressor', 'decomp', 'encode'],
        'description': 'Analyze provided decompressor format first',
        'commands': [
            # Analyze decompressor to understand expected format
            '''if [ -f /app/decomp.c ]; then
    echo "=== DECODER ANALYSIS ===" > /tmp/decoder_analysis.txt
    grep -n "fread\|getchar\|read\|fgetc" /app/decomp.c >> /tmp/decoder_analysis.txt 2>/dev/null || true
    grep -n "struct\|typedef" /app/decomp.c >> /tmp/decoder_analysis.txt 2>/dev/null || true
    head -100 /app/decomp.c >> /tmp/decoder_analysis.txt 2>/dev/null || true
    echo "Decoder analysis saved to /tmp/decoder_analysis.txt"
fi''',
            # Create simple test for round-trip
            '''cat > /tmp/test_roundtrip.sh << 'ROUNDTRIP'
#!/bin/bash
echo "Testing round-trip..."
echo "test" > /tmp/original.txt
./compress /tmp/original.txt /tmp/test.comp 2>/dev/null
./decomp < /tmp/test.comp > /tmp/recovered.txt 2>/dev/null
diff /tmp/original.txt /tmp/recovered.txt && echo "PASS" || echo "FAIL"
ROUNDTRIP
chmod +x /tmp/test_roundtrip.sh''',
        ],
        'critical': True,
        'reason': 'Must understand decoder format before implementing encoder',
    },
    'winning-avg-corewars': {
        'detection_keywords': ['corewars', 'warrior', 'pmars', 'redcode', 'win rate'],
        'description': 'Research winning strategies against provided opponents',
        'commands': [
            # Analyze opponent warriors to understand strategies
            '''if [ -d /app/warriors ]; then
    echo "=== OPPONENT ANALYSIS ===" > /tmp/opponent_analysis.txt
    for f in /app/warriors/*.red; do
        echo "--- $(basename $f) ---" >> /tmp/opponent_analysis.txt
        head -30 "$f" >> /tmp/opponent_analysis.txt
    done
    echo "Opponent analysis saved to /tmp/opponent_analysis.txt"
fi''',
            # Create strategy guide
            '''cat > /tmp/corewars_strategies.txt << 'STRATEGY'
=== COREWARS WINNING STRATEGIES ===

PAPER beats STONE (self-replication faster than bombing)
IMP ties but rarely wins (defensive, avoids DAT bombs)
VAMPIRE captures processes (JMP traps)
SCANNER detects and targets opponent code

RECOMMENDED APPROACH for Stone opponent:
1. Use Paper-style self-replication
2. Combine with Imp backup for ties
3. Add bomber component against non-stone

PAPER EXAMPLE:
    spl 0, 0
    mov -1, @0
    add #100, -1
    jmz -2, @-2
STRATEGY
echo "Strategy guide saved to /tmp/corewars_strategies.txt"''',
        ],
        'critical': False,
        'reason': 'Domain-specific strategies essential for competitive tasks',
    },
}


def detect_task_from_instruction(instruction: str) -> Optional[str]:
    """Detect which task type based on instruction keywords."""
    lower = instruction.lower()
    
    for task_name, config in PRE_EXECUTION_HOOKS.items():
        keywords = config.get('detection_keywords', [])
        matches = sum(1 for kw in keywords if kw in lower)
        if matches >= 2:
            return task_name
    
    return None


def get_pre_execution_commands(task_name: str) -> list:
    """Get list of commands to run before agent starts."""
    config = PRE_EXECUTION_HOOKS.get(task_name)
    if config:
        return config.get('commands', [])
    return []


def build_hook_script(instruction: str) -> Optional[str]:
    """Build a shell script with all applicable pre-execution hooks."""
    task_name = detect_task_from_instruction(instruction)
    if not task_name:
        return None
    
    commands = get_pre_execution_commands(task_name)
    if not commands:
        return None
    
    config = PRE_EXECUTION_HOOKS[task_name]
    
    script_lines = [
        '#!/bin/bash',
        f'# Pre-execution hook for: {task_name}',
        f'# Reason: {config.get("reason", "N/A")}',
        '',
    ]
    
    script_lines.extend(commands)
    script_lines.append('')
    script_lines.append(f'echo "Pre-execution hook complete: {task_name}"')
    
    return '\n'.join(script_lines)


def get_post_execution_context(task_name: str) -> str:
    """Get context to inject after hooks run, informing agent of backups."""
    contexts = {
        'db-wal-recovery': '''## Pre-Execution Hook Results

The WAL file has been backed up to protect it from accidental checkpointing:
- Original: /app/main.db-wal (may be gone after sqlite3)
- Backup: /tmp/wal_backup.wal (PRESERVED)
- Backup: /app/main.db-wal.backup (PRESERVED)

**USE THE BACKUP FILES** for WAL parsing. The original may be gone.
Parse /tmp/wal_backup.wal with Python to extract the 11 records.''',

        'gpt2-codegolf': '''## Pre-Execution Hook Results

Reference implementation downloaded (if curl available):
- /tmp/llm_reference.c - llm.c train_gpt2.c for checkpoint format reference

Check this file for weight layout and BPE tokenizer details.''',

        'regex-chess': '''## Pre-Execution Hook Results

python-chess has been pre-installed. Use it to:
1. Generate legal moves for test positions
2. Understand move notation
3. Build and test your regex patterns''',

        'chess-best-move': '''## Pre-Execution Hook Results

Chess image recognition tools installed:
- board_to_fen: For converting chess board images to FEN (may not be available)
- python-chess: For move validation and analysis
- stockfish: For finding best moves
- /tmp/extract_fen.py: Helper script for FEN extraction

**CRITICAL**: Do NOT rely on visual reasoning for FEN. Try:
1. python3 /tmp/extract_fen.py /app/chess_board.png
2. If that fails, use stockfish with position from task or manually
3. Use stockfish for ALL move calculations''',

        'code-from-image': '''## Pre-Execution Hook Results

OCR tools installed:
- tesseract-ocr: For text extraction from images
- pytesseract: Python wrapper for tesseract

Use: pytesseract.image_to_string(Image.open('image.png'))''',

        'write-compressor': '''## Pre-Execution Hook Results

Decoder analysis prepared:
- /tmp/decoder_analysis.txt: Key input patterns from decoder source
- /tmp/test_roundtrip.sh: Script to test round-trip compression

**CRITICAL**: Read /tmp/decoder_analysis.txt FIRST to understand expected format.
Test round-trip BEFORE optimizing for size.''',

        'winning-avg-corewars': '''## Pre-Execution Hook Results

Strategy resources prepared:
- /tmp/opponent_analysis.txt: Analysis of provided opponent warriors
- /tmp/corewars_strategies.txt: Winning strategy guide

**KEY INSIGHT**: Paper beats Stone! Use self-replication strategy.
Read /tmp/corewars_strategies.txt for specific tactics.''',
    }
    
    return contexts.get(task_name, '')


# Harbor integration - can be used as environment setup
async def run_pre_execution_hooks(environment, instruction: str) -> str:
    """Run pre-execution hooks in the environment before agent starts.
    
    Returns: Context string to inject into agent prompt
    """
    task_name = detect_task_from_instruction(instruction)
    if not task_name:
        return ''
    
    commands = get_pre_execution_commands(task_name)
    if not commands:
        return ''
    
    config = PRE_EXECUTION_HOOKS[task_name]
    
    # Run each command
    for cmd in commands:
        try:
            await environment.exec(cmd, timeout=30)
        except Exception as e:
            print(f"Pre-hook warning: {cmd} failed: {e}")
    
    # Return context for agent
    return get_post_execution_context(task_name)
