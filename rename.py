import re

with open('src/routes/login.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make it snake_case
replacements = {
    'isRegistering': 'is_registering',
    'setIsRegistering': 'set_is_registering',
    'loginEmail': 'login_email',
    'setLoginEmail': 'set_login_email',
    'loginPassword': 'login_password',
    'setLoginPassword': 'set_login_password',
    'loginLoading': 'login_loading',
    'setLoginLoading': 'set_login_loading',
    'loginError': 'login_error',
    'setLoginError': 'set_login_error',
    'regEmail': 'reg_email',
    'setRegEmail': 'set_reg_email',
    'regPassword': 'reg_password',
    'setRegPassword': 'set_reg_password',
    'confirmPassword': 'confirm_password',
    'setConfirmPassword': 'set_confirm_password',
    'regLoading': 'reg_loading',
    'setRegLoading': 'set_reg_loading',
    'regError': 'reg_error',
    'setRegError': 'set_reg_error',
    'showLoginPassword': 'show_login_password',
    'setShowLoginPassword': 'set_show_login_password',
    'showRegPassword': 'show_reg_password',
    'setShowRegPassword': 'set_show_reg_password',
    'showConfirmPassword': 'show_confirm_password',
    'setShowConfirmPassword': 'set_show_confirm_password',
    'regSuccess': 'reg_success',
    'setRegSuccess': 'set_reg_success',
    ', addMockUser': '',
    'handleLogin': 'handle_login',
    'handleRegister': 'handle_register'
}

for k, v in replacements.items():
    text = text.replace(k, v)

with open('src/routes/login.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
