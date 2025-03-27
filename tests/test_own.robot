*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot  

*** Variables ***
${URL}             http://localhost:5173
${USERNAME}        jonathan
${EMAIL}           test@example.com
${USER_PASSWORD}   123

*** Test Cases ***
Test Login Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}
    
    # Ensure the page is fully loaded
    Wait For Elements State    css=header    visible    timeout=10s
    
    # Check if already logged in and log out if necessary
    Ensure Logged Out
    
    # Click login button
    Click    id=login-button
    
    # Input username and password
    Fill Text    id=login-username    ${USERNAME}
    Fill Text    id=login-password    ${USER_PASSWORD}
    
    # Click login button within the form
    Click    css=form#login-form button[type="submit"]
    
    # Wait for and verify user greeting
    Wait For Elements State    id=user-greeting    visible    timeout=5s
    Get Text    id=user-greeting    *=    Hei, ${USERNAME}

Test Registration Flow
    New Browser    chromium    headless=No  
    New Page       ${URL}
    
    # Ensure the page is fully loaded
    Wait For Elements State    css=header    visible    timeout=10s
    
    # Check if already logged in and log out if necessary
    Ensure Logged Out
    
    # Click login button
    Click    id=login-button
    
    # Switch to registration tab
    Click    id=register-tab
    
    # Wait for registration form
    Wait For Elements State    id=register-form    visible    timeout=5s
    
    # Generate unique username and email
    ${UNIQUE_USERNAME}=    Evaluate    f"${USERNAME}_new_{int(time.time())}"
    ${UNIQUE_EMAIL}=       Evaluate    f"new_{int(time.time())}@example.com"
    
    # Fill out registration form
    Fill Text    id=register-username    ${UNIQUE_USERNAME}
    Fill Text    id=register-email       ${UNIQUE_EMAIL}
    Fill Text    id=register-password    ${USER_PASSWORD}
    Fill Text    id=register-confirm-password    ${USER_PASSWORD}
    
    # Submit registration
    Click    css=form#register-form button[type="submit"]
    
    # Verify success message
    Wait For Elements State    id=register-error    visible    timeout=5s
    Get Text    id=register-error    *=    Rekisteröinti onnistui

*** Keywords ***
Ensure Logged Out
    # Check if user is logged in by looking for user menu trigger
    ${is_logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=user-menu-trigger    visible    timeout=2s
    
    # If logged in, perform logout
    Run Keyword If    ${is_logged_in}    Logout User

Logout User
    # Click user menu trigger to expand menu
    Click    id=user-menu-trigger
    
    # Click logout button
    Click    id=logout-button
    
    # Wait for login button to be visible, confirming logout
    Wait For Elements State    id=login-button    visible    timeout=5s