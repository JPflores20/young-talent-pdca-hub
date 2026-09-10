import re

with open('src/routes/__tests__/index.test.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import * as auth_context from "@/context/auth-context";', 'import { useAuth } from "@/context/auth-context";')
content = content.replace('import * as pdca_context from "@/context/pdca-context";', 'import { usePdcas } from "@/context/pdca-context";')
content = content.replace('(auth_context.useAuth as any)', '(useAuth as any)')
content = content.replace('(pdca_context.usePdcas as any)', '(usePdcas as any)')

if 'vi.mock("@/context/auth-context")' not in content:
    content += '''
vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/context/pdca-context", () => ({
  usePdcas: vi.fn(),
}));
'''

with open('src/routes/__tests__/index.test.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
