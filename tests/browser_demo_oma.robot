*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot  

*** Variables ***
${URL}             http://localhost:5173
${USERNAME}        jonathan
${EMAIL}           test@example.com

*** Test Cases ***
Test Login Flow
    New Browser    chromium    headless=No
    New Page       ${URL}
    Get Title      *=    PasaGym
    Click          id=login-button
    
    # Test login form
    Wait For Elements State    id=login-modal    visible
    Type Text      id=login-username    ${USERNAME}    delay=0.1s
    Fill Secret    id=login-password    123
    Click          button.form-button >> text=Kirjaudu sisään
    
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
    Fill Secret    id=register-password    123
    Fill Secret    id=register-confirm-password    123
    Click          button.form-button >> text=Rekisteröidy
    
    # Verify success message
    Wait For Elements State    id=register-error    visible
    Get Text       id=register-error    *=    Rekisteröinti onnistui