import re

with open('src/routes/login.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract handle_login function
login_func_match = re.search(r'const handle_login = async .*?finally \{\n      set_login_loading\(false\);\n    \}\n  \};', text, re.DOTALL)
login_func = login_func_match.group(0) if login_func_match else ''

# Extract handle_register function
reg_func_match = re.search(r'const handle_register = async .*?finally \{\n      set_reg_loading\(false\);\n    \}\n  \};', text, re.DOTALL)
reg_func = reg_func_match.group(0) if reg_func_match else ''

# Extract forms
login_form_match = re.search(r'(<form onSubmit=\{handle_login\}.*?</form>)', text, re.DOTALL)
login_form_jsx = login_form_match.group(0) if login_form_match else ''

reg_form_match = re.search(r'(<form onSubmit=\{handle_register\}.*?</form>)', text, re.DOTALL)
reg_form_jsx = reg_form_match.group(0) if reg_form_match else ''

login_component = f'''import {{ useState }} from "react";
import {{ Lock, Mail, AlertCircle, Eye, EyeOff }} from "lucide-react";
import {{ Button }} from "@/components/ui/button";
import {{ Input }} from "@/components/ui/input";
import {{ Label }} from "@/components/ui/label";
import {{ useAuth }} from "@/context/auth-context";
import {{ useNavigate }} from "@tanstack/react-router";

export function LoginForm() {{
  const navigate = useNavigate();
  const {{ login }} = useAuth();
  const [login_email, set_login_email] = useState("");
  const [login_password, set_login_password] = useState("");
  const [login_loading, set_login_loading] = useState(false);
  const [login_error, set_login_error] = useState<string | null>(null);
  const [show_login_password, set_show_login_password] = useState(false);

  {login_func}

  return (
    {login_form_jsx}
  );
}}
'''

reg_component = f'''import {{ useState }} from "react";
import {{ Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff, User }} from "lucide-react";
import {{ Button }} from "@/components/ui/button";
import {{ Input }} from "@/components/ui/input";
import {{ Label }} from "@/components/ui/label";
import {{ createUserWithEmailAndPassword, sendEmailVerification, signOut }} from "firebase/auth";
import {{ doc, setDoc }} from "firebase/firestore";
import {{ primaryAuth, db }} from "@/lib/firebase";

export function RegisterForm({{ on_success }}: {{ on_success: () => void }}) {{
  const [nombre, set_nombre] = useState("");
  const [paterno, set_paterno] = useState("");
  const [materno, set_materno] = useState("");
  const [reg_email, set_reg_email] = useState("");
  const [reg_password, set_reg_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [reg_loading, set_reg_loading] = useState(false);
  const [reg_error, set_reg_error] = useState<string | null>(null);
  const [show_reg_password, set_show_reg_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);

  {reg_func.replace('set_reg_success(true);', 'on_success();')}

  return (
    {reg_form_jsx}
  );
}}
'''

with open('src/components/auth/login-form.tsx', 'w', encoding='utf-8') as f:
    f.write(login_component)

with open('src/components/auth/register-form.tsx', 'w', encoding='utf-8') as f:
    f.write(reg_component)

# Now remove these from login.tsx and replace with <LoginForm /> and <RegisterForm />
text = text.replace(login_func, '')
text = text.replace(reg_func, '')

# We also need to remove state variables from login.tsx
state_vars_to_remove = [
    r'const \[login_email.*?;',
    r'const \[login_password.*?;',
    r'const \[login_loading.*?;',
    r'const \[login_error.*?;',
    r'const \[show_login_password.*?;',
    r'const \[nombre.*?;',
    r'const \[paterno.*?;',
    r'const \[materno.*?;',
    r'const \[reg_email.*?;',
    r'const \[reg_password.*?;',
    r'const \[confirm_password.*?;',
    r'const \[reg_loading.*?;',
    r'const \[reg_error.*?;',
    r'const \[show_reg_password.*?;',
    r'const \[show_confirm_password.*?;',
]
for p in state_vars_to_remove:
    text = re.sub(p, '', text)

text = text.replace(login_form_jsx, '<LoginForm />')
text = text.replace(reg_form_jsx, '<RegisterForm on_success={() => set_reg_success(true)} />')

text = 'import { LoginForm } from "@/components/auth/login-form";\nimport { RegisterForm } from "@/components/auth/register-form";\n' + text

with open('src/routes/login.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

