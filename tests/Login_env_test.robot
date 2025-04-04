*** Settings ***
Library     Browser    auto_closing_level=KEEP
Variables    load_env.py

*** Test Cases ***
Test .env Flow
    [Documentation]    Esimerkkitapaus, jossa käytetään ympäristömuuttujia
    Log    API Key: ${API_KEY}
    Log    Base URL: ${BASE_URL}
    
Test Login Flow
    New Browser    chromium    headless=No  
    New Page       ${BASE_URL}

    Ensure Logged Out
    Click    id=login-button

    Fill Text    id=login-username    ${username}   
    Fill Text    id=login-password    ${password}  
    Click    css=form#login-form button[type="submit"]
    
*** Keywords ***
Ensure Logged Out
    ${is_logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=user-menu-trigger    visible    timeout=2s
    Run Keyword If    ${is_logged_in}    Logout User

Logout User
    Click    id=user-menu-trigger
    Click    id=logout-button
    Wait For Elements State    id=login-button    visible    timeout=5s