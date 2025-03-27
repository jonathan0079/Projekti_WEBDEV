*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot

*** Test Cases ***
Test Web Form
    New Browser    chromium    headless=No  
    New Page       https://www.selenium.dev/selenium/web/web-form.html 
    Get Title      ==    Web form  
    Type Text      [name="my-text"]        ${Username}    delay=0.05 s
    Type Secret    [name="my-password"]    $Password      delay=0.05 s
    Type Text      [name="my-textarea"]    ${Message}     delay=0.05 s
    Select Options By        [name="my-select"]    value    ${DropdownValue}    delay=0.05 s
    Type Text        [name="my-datalist"]   ${DropdownDatalist}    delay=0.05 s
    Upload File By Selector    input[name="my-file"]    ${FileToUpload}
    Uncheck Checkbox    input[id="my-check-1"]
    Check Checkbox      input[id="my-check-2"]
    Click    [id="my-radio-2"]
    
    Click With Options    button    delay=2 s
    Get Text       id=message    ==    Received!