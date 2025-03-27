*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot  

*** Variables ***
${URL}             http://localhost:5173
${USERNAME}        jonathan
${EMAIL}           test@example.com
# Note: We define password without ${} for later use with $ prefix
PASSWORD           123

*** Test Cases ***
Test Login Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}
    Get Title      *=    PasaGym
    Click          id=login-button
    
    # Test login form
    Wait For Elements State    id=login-modal    visible
    Fill    id=login-username    ${USERNAME}
    Fill    id=login-password    123
    
    # Verify successful login
    Wait For Elements State    id=user-greeting    visible
    Get Text       id=user-greeting    *=    Hei, ${USERNAME}

Test Registration Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}
    Get Title      *=    PasaGym
    Click          id=login-button
    
    # Switch to registration tab
    Click          id=register-tab
    
    # Fill out registration form
    Wait For Elements State    id=register-form    visible
    Type Text      id=register-username    ${USERNAME}_new    delay=0.1s
    Type Text      id=register-email       new_${EMAIL}       delay=0.1s
    # Use $PASSWORD syntax (no curly braces)
    Type Secret    id=register-password    $PASSWORD          delay=0.1s
    Type Secret    id=register-confirm-password    $PASSWORD  delay=0.1s
    Click          css=form#register-form button[type="submit"]
    
    # Verify success message
    Wait For Elements State    id=register-error    visible
    Get Text       id=register-error    *=    Rekisteröinti onnistui