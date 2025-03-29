*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keys.robot

*** Test Cases ***
Test Diary Entry Creation
    New Browser    chromium    headless=No  
    New Page       ${URL}
    
    Wait For Elements State    css=header    visible    timeout=10s
    Ensure Logged Out
    Click    id=login-button

    Fill Text    id=login-username    ${username}   
    Fill Text    id=login-password    ${password}  
    Click    css=form#login-form button[type="submit"]

    Click    id=diary-nav-link
    Wait For Elements State    id=diary-form    visible    timeout=10s
    
    Type Text    input[id="entry-date"]    ${diary_date}    delay=0.05 s
    Select Options By   [id="mood"]  value    ${diary_mood}    delay=0.05 s
    Type Text    input[id="weight"]    ${diary_weight}    delay=0.05 s
    Type Text    input[id="sleep-hours"]    ${diary_sleep}    delay=0.05 s
    Type Text    textarea[id="notes"]    ${diary_message}    delay=0.05 s
    Click    [id="submit-entry"]
*** Keywords ***
Ensure Logged Out
    ${is_logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=user-menu-trigger    visible    timeout=2s
    Run Keyword If    ${is_logged_in}    Logout User
Logout User
    Click    id=user-menu-trigger
    Click    id=logout-button
    Wait For Elements State    id=login-button    visible    timeout=5s