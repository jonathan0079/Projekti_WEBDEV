*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keys.robot  

*** Test Cases ***
Test Login Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}

    Ensure Logged Out
    Click    id=login-button

    Fill Text    id=login-username    ${username}   
    Fill Text    id=login-password    ${password}  
    Click    css=form#login-form button[type="submit"]

Test Registration Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}
    
    Wait For Elements State    css=header    visible    timeout=10s
    Ensure Logged Out
    Click    id=login-button
    Click    id=register-tab
    Wait For Elements State    id=register-form    visible    timeout=10s

    ${unique_username}=    Evaluate    f"${username}_new_{int(time.time())}"
    ${unique_email}=       Evaluate    f"new_{int(time.time())}@example.com"
    
    Fill Text    id=register-username    ${unique_username}
    Fill Text    id=register-email       ${unique_email}
    Fill Text    id=register-password    ${password}
    Fill Text    id=register-confirm-password    ${password}
    Click    css=form#register-form button[type="submit"]
    
*** Keywords ***
Ensure Logged Out
    ${is_logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=user-menu-trigger    visible    timeout=2s
    Run Keyword If    ${is_logged_in}    Logout User

Logout User
    Click    id=user-menu-trigger
    Click    id=logout-button
    Wait For Elements State    id=login-button    visible    timeout=5s