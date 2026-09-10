import re

with open('src/context/pdca-context.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'const PdcaContext = createContext<PdcaContextValue>\(\{.*?\}\);', 'const PdcaContext = createContext<PdcaContextValue | undefined>(undefined);', content, flags=re.DOTALL)

with open('src/context/pdca-context.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
