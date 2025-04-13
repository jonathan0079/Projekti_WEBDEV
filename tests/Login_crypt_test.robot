*** Settings ***
Library     Browser    auto_closing_level=KEEP
Library     CryptoLibrary     variable_decryption=True
Resource    Keys.robot  

*** Test Cases ***
Test Login Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}

    Ensure Logged Out
    Click    id=login-button

    Fill Text    id=login-username    ${username_crypted}   
    Fill Text    id=login-password    ${password_crypted}  
    Click    css=form#login-form button[type="submit"]

*** Keywords ***
Ensure Logged Out
    ${is_logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=user-menu-trigger    visible    timeout=2s
    Run Keyword If    ${is_logged_in}    Logout User

Logout User
    Click    id=user-menu-trigger
    Click    id=logout-button
    Wait For Elements State    id=login-button    visible    timeout=5s