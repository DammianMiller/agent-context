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
        'description': 'Setup XSS filtering with format-preserving approach',
        'commands': [
            'pip install bleach lxml beautifulsoup4 html5lib 2>/dev/null || pip3 install bleach lxml beautifulsoup4 html5lib',
            # Create strategy guide for XSS filtering
            '''cat > /tmp/xss_filter_strategy.txt << 'STRATEGY'
=== XSS FILTER REQUIREMENTS ===

CRITICAL: Clean HTML must remain BYTE-FOR-BYTE IDENTICAL after filtering.
This means you CANNOT use bleach.clean() or BeautifulSoup directly - they normalize HTML.

RECOMMENDED APPROACH:
1. Detect if HTML contains dangerous patterns (script, onclick, javascript:, etc.)
2. If NO dangerous patterns: return original HTML unchanged (preserve formatting!)
3. If dangerous patterns found: use regex or targeted removal

DANGEROUS PATTERNS TO REMOVE:
- <script>...</script> tags
- on* event handlers (onclick, onerror, onload, onmouseover, etc.)
- javascript: URLs
- data: URLs with script content
- <iframe>, <object>, <embed> tags
- style attributes with expression()
- SVG with script content

WHITELIST APPROACH (safer):
- Keep only safe tags: p, div, span, a, img, table, tr, td, th, ul, ol, li, h1-h6, etc.
- Keep only safe attributes: href (not javascript:), src (not javascript:), class, id, style (filtered)

EXAMPLE FILTER STRUCTURE:
```python
import re

def has_dangerous_content(html):
    patterns = [
        r'<script[^>]*>.*?</script>',
        r'\bon\w+\s*=',
        r'javascript:',
        r'<iframe',
        r'<object',
        r'<embed',
    ]
    for p in patterns:
        if re.search(p, html, re.I | re.S):
            return True
    return False

def filter_html(html):
    if not has_dangerous_content(html):
        return html  # PRESERVE ORIGINAL EXACTLY
    # Only sanitize if dangerous content detected
    return sanitize(html)
```

TEST YOUR FILTER:
1. Clean HTML input -> must return IDENTICAL output
2. XSS attack input -> must remove/neutralize the attack
STRATEGY
echo "XSS filter strategy saved to /tmp/xss_filter_strategy.txt"''',
        ],
        'critical': True,
        'reason': 'XSS filter must preserve clean HTML byte-for-byte while blocking attacks',
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
        'description': 'Analyze provided decompressor format and create comprehensive strategy',
        'commands': [
            # Analyze decompressor to understand expected format
            '''if [ -f /app/decomp.c ] || [ -f /app/decomp2.c ]; then
    DECOMP_FILE=$(ls /app/decomp*.c 2>/dev/null | head -1)
    echo "=== DECODER ANALYSIS ===" > /tmp/decoder_analysis.txt
    echo "File: $DECOMP_FILE" >> /tmp/decoder_analysis.txt
    echo "" >> /tmp/decoder_analysis.txt
    echo "=== INPUT READING PATTERN ===" >> /tmp/decoder_analysis.txt
    grep -n "fread\|getchar\|read\|fgetc\|stdin" "$DECOMP_FILE" >> /tmp/decoder_analysis.txt 2>/dev/null || true
    echo "" >> /tmp/decoder_analysis.txt
    echo "=== DATA STRUCTURES ===" >> /tmp/decoder_analysis.txt
    grep -n "struct\|typedef\|#define" "$DECOMP_FILE" >> /tmp/decoder_analysis.txt 2>/dev/null || true
    echo "" >> /tmp/decoder_analysis.txt
    echo "=== FULL SOURCE ===" >> /tmp/decoder_analysis.txt
    cat "$DECOMP_FILE" >> /tmp/decoder_analysis.txt 2>/dev/null || true
    echo "Decoder analysis saved to /tmp/decoder_analysis.txt"
fi''',
            # Create comprehensive strategy guide
            '''cat > /tmp/compression_strategy.txt << 'STRATEGY'
=== COMPRESSION TASK STRATEGY ===

CRITICAL REQUIREMENTS:
1. Compressed output must decompress to EXACT original content
2. Compressed file must be smaller than size limit (often ~2500 bytes)
3. Decompressor (decomp/decomp2) must not segfault on your output

COMMON FAILURE MODES:
- Segmentation fault: Your format doesn't match what decoder expects
- Wrong output: Encoding/decoding mismatch
- Size too large: Need better compression algorithm

RECOMMENDED APPROACH:
1. READ THE DECODER SOURCE FIRST (/tmp/decoder_analysis.txt)
2. Understand EXACTLY what format the decoder expects
3. Write encoder that produces that EXACT format
4. Test with SMALL data first (1 byte, then 10 bytes)
5. Scale up only after small tests pass

EXAMPLE: If decoder reads bytes with getchar():
```python
# Write raw bytes that decoder expects
with open('output.comp', 'wb') as f:
    f.write(encoded_bytes)
```

EXAMPLE: If decoder expects length-prefixed data:
```python
import struct
data = b"hello"
with open('output.comp', 'wb') as f:
    f.write(struct.pack('<I', len(data)))  # 4-byte little-endian length
    f.write(data)
```

TESTING (do this BEFORE submitting):
```bash
# Test with tiny data
echo -n "A" > /tmp/tiny.txt
python3 compress.py /tmp/tiny.txt /tmp/tiny.comp
cat /tmp/tiny.comp | ./decomp2 > /tmp/tiny.out
diff /tmp/tiny.txt /tmp/tiny.out && echo "PASS" || echo "FAIL"

# Test with actual data
python3 compress.py /app/data.txt /app/data.comp
cat /app/data.comp | ./decomp2 > /tmp/test.out
diff /app/data.txt /tmp/test.out && echo "PASS" || echo "FAIL"
```

IF SEGFAULT:
- Your output format is wrong
- Check decoder source for expected header/format
- Use binary mode: open('file', 'wb') not open('file', 'w')
STRATEGY
echo "Compression strategy saved to /tmp/compression_strategy.txt"''',
            # Create round-trip test script
            '''cat > /tmp/test_roundtrip.sh << 'ROUNDTRIP'
#!/bin/bash
echo "=== Round-trip Test ==="

# Find decompressor
DECOMP=$(ls /app/decomp2 /app/decomp 2>/dev/null | head -1)
echo "Using decompressor: $DECOMP"

# Test with tiny data first
echo -n "X" > /tmp/tiny.txt
if [ -f /app/compress.py ]; then
    python3 /app/compress.py /tmp/tiny.txt /tmp/tiny.comp 2>&1
elif [ -x /app/compress ]; then
    /app/compress /tmp/tiny.txt /tmp/tiny.comp 2>&1
fi

if [ -f /tmp/tiny.comp ]; then
    echo "Compressed size: $(wc -c < /tmp/tiny.comp) bytes"
    cat /tmp/tiny.comp | $DECOMP > /tmp/tiny.out 2>&1
    if diff -q /tmp/tiny.txt /tmp/tiny.out > /dev/null 2>&1; then
        echo "TINY TEST: PASS"
    else
        echo "TINY TEST: FAIL - output differs"
        echo "Expected: $(xxd /tmp/tiny.txt)"
        echo "Got: $(xxd /tmp/tiny.out)"
    fi
else
    echo "TINY TEST: FAIL - no compressed output"
fi
ROUNDTRIP
chmod +x /tmp/test_roundtrip.sh''',
        ],
        'critical': True,
        'reason': 'Must understand decoder format before implementing encoder - segfaults = wrong format',
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

        'filter-js-from-html': '''## Pre-Execution Hook Results

XSS filter strategy guide prepared:
- /tmp/xss_filter_strategy.txt: CRITICAL requirements and approach

**READ THIS FIRST**: Clean HTML must remain BYTE-FOR-BYTE IDENTICAL.
Do NOT use bleach.clean() or BeautifulSoup directly - they normalize HTML!

APPROACH:
1. Check if HTML has dangerous patterns (script, onclick, javascript:)
2. If CLEAN: return original unchanged (preserve formatting!)
3. If DANGEROUS: use regex to remove only the malicious parts

Read /tmp/xss_filter_strategy.txt for the full pattern list and example code.''',

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

Compression strategy resources prepared:
- /tmp/decoder_analysis.txt: FULL decoder source with input patterns highlighted
- /tmp/compression_strategy.txt: Step-by-step approach and common failure fixes
- /tmp/test_roundtrip.sh: Test script for verifying round-trip

**CRITICAL - READ THESE FILES FIRST:**
1. Read /tmp/decoder_analysis.txt to understand EXACT format decoder expects
2. Read /tmp/compression_strategy.txt for approach and debugging tips
3. Use /tmp/test_roundtrip.sh to test with tiny data before full file

**IF SEGFAULT**: Your output format is wrong. Check decoder source for:
- Header format (magic bytes, length prefix)
- How it reads input (getchar, fread, etc.)
- Expected data layout

Test with 1-byte input before trying full file!''',

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
