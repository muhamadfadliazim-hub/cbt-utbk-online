import os

with open('soal_format_baru.txt', 'r') as f:
    content = f.read()

blocks = content.split('\n---\n')

# Ensure we don't have trailing empty blocks
blocks = [b.strip() for b in blocks if b.strip()]

for i in range(0, len(blocks), 10):
    batch = blocks[i:i+10]
    filename = f"soal_TKA_BI_{(i+1)}_sampai_{min(i+10, len(blocks))}.txt"
    with open(filename, 'w') as f:
        f.write('\n---\n'.join(batch) + '\n---\n')
    print(f"Created {filename}")
